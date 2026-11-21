import os
import re
import email
from email import policy
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

# Inicializar cliente de Gemini usando el SDK oficial actual
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

app = FastAPI(title="PhishGuard AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ESQUEMA DE SALIDA ESTRUCTURADA JSON (RF-06) ---
class HighlightChunk(BaseModel):
    text: str
    type: str = Field(description="normal, warning, o danger")

class HeuristicCheck(BaseModel):
    rule: str
    status: str = Field(description="fail, warning, o pass")
    detail: str

class EmailAnalysisResponse(BaseModel):
    score: int = Field(description="Puntaje de riesgo de 0 a 100")
    category: str = Field(description="Seguro (0-29), Sospechoso (30-69) o Phishing/Malicioso (70-100)")
    from_visible: str
    from_real: str
    subject: str
    heuristics: List[HeuristicCheck]
    highlighted_text: List[HighlightChunk]
    explanation: str = Field(description="Explicación en español simple sobre el nivel de riesgo (RF-09)")

# --- FUNCION DE PARSING DE CORREO (RF-01, RF-02, RF-03) ---
def parse_email_content(raw_bytes: bytes = None, raw_text: str = None):
    from_visible = "Desconocido"
    from_real = "Desconocido"
    subject = "Sin asunto"
    body = ""

    if raw_bytes:
        msg = email.message_from_bytes(raw_bytes, policy=policy.default)
        from_visible = msg.get("From", "Desconocido")
        # Extraer dirección real del Return-Path o Sender si existe
        from_real = msg.get("Return-Path", msg.get("Sender", from_visible))
        subject = msg.get("Subject", "Sin asunto")

        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                if content_type == "text/plain":
                    body += part.get_content()
        else:
            body = msg.get_content()
    elif raw_text:
        body = raw_text
        # Búsqueda simple de encabezados si pegaron código fuente MIME completo
        from_match = re.search(r"From:\s*(.+)", raw_text, re.IGNORECASE)
        subj_match = re.search(r"Subject:\s*(.+)", raw_text, re.IGNORECASE)
        if from_match:
            from_visible = from_match.group(1).strip()
            from_real = from_visible
        if subj_match:
            subject = subj_match.group(1).strip()

    # Detección básica de URLs
    urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', body)

    return {
        "from_visible": from_visible,
        "from_real": from_real,
        "subject": subject,
        "body": body if body else raw_text,
        "urls": urls
    }

# --- ENDPOINT PRINCIPAL DE ANÁLISIS ---
@app.post("/api/v1/analyze-email", response_model=EmailAnalysisResponse)
async def analyze_email(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    if not text and not file:
        raise HTTPException(status_code=400, detail="Debe proporcionar texto o un archivo .eml")

    # 1. Parsing
    raw_bytes = await file.read() if file else None
    parsed = parse_email_content(raw_bytes=raw_bytes, raw_text=text)

    if not client:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY no configurada en el archivo .env")

    # 2. Prompt estructurado para Gemini (RF-04, RF-05, RF-06, RF-07, RF-08, RF-09)
    prompt = f"""
    Actúa como un experto en ciberseguridad especializado en análisis de Phishing e Ingeniería Social.
    Analiza el siguiente correo electrónico:

    METADATOS:
    - Remitente Visible: {parsed['from_visible']}
    - Remitente Real / Return-Path: {parsed['from_real']}
    - Asunto: {parsed['subject']}
    - URLs detectadas: {parsed['urls']}

    CUERPO DEL CORREO:
    {parsed['body']}

    INSTRUCCIONES EVALUACIÓN:
    1. Evalúa si hay discrepancias entre remitente visible y real, o uso de acortadores/dominios sospechosos.
    2. Identifica patrones de ingeniería social (urgencia, coerción, suplantación de identidad, solicitudes de datos).
    3. Calcula un 'score' de riesgo global de 0 a 100.
    4. Clasifica la categoría en: 'Seguro (0-29)', 'Sospechoso (30-69)' o 'Phishing/Malicioso (70-100)'.
    5. Divide el cuerpo del correo en fragmentos ('highlighted_text') asignando a cada fragmento el tipo:
       - 'normal': Texto neutro.
       - 'warning': Puntos de atención leve o duda.
       - 'danger': Fragmentos altamente maliciosos, amenazas, links engañosos o llamadas de urgencia.
    6. Proporciona una explicación concisa en español simple (XAI) de por qué se asignó ese puntaje.
    """

    try:
        # Llamada a la API usando Structured Outputs
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=EmailAnalysisResponse,
                temperature=0.1,
            ),
        )
        
        # FastAPI y Pydantic deserializan automáticamente el JSON devuelto
        import json
        result_dict = json.loads(response.text)
        return result_dict

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en el análisis del LLM: {str(e)}")