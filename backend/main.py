# import os
# import re
# import email
# from email import policy
# from fastapi import FastAPI, UploadFile, File, Form, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel, Field
# from typing import List, Optional
# from dotenv import load_dotenv
# from google import genai
# from google.genai import types

# from fastapi import Depends
# from auth import get_current_user
# from models import Usuario

# from auth import router as auth_router



# from io import BytesIO
# from datetime import datetime
# from xml.sax.saxutils import escape

# from fastapi.responses import StreamingResponse

# from reportlab.lib import colors
# from reportlab.lib.enums import TA_CENTER, TA_LEFT
# from reportlab.lib.pagesizes import A4
# from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
# from reportlab.lib.units import cm
# from reportlab.platypus import (
#     SimpleDocTemplate,
#     Paragraph,
#     Spacer,
#     Table,
#     TableStyle,
#     KeepTogether
# )


# load_dotenv()

# # Inicializar cliente de Gemini usando el SDK oficial actual
# api_key = os.getenv("GEMINI_API_KEY")
# client = genai.Client(api_key=api_key) if api_key else None

# app = FastAPI(title="PhishGuard AI Backend")

# # app.add_middleware(
# #     CORSMiddleware,
# #     allow_origins=["*"],
# #     allow_credentials=True,
# #     allow_methods=["*"],
# #     allow_headers=["*"],
# # )


# # CONFIGURACION CORS
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:5173"
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"]
# )

# # RUTAS DE AUTENTICACION
# app.include_router(auth_router)

# # --- ESQUEMA DE SALIDA ESTRUCTURADA JSON (RF-06) ---
# class HighlightChunk(BaseModel):
#     text: str
#     type: str = Field(description="normal, warning, o danger")

# class HeuristicCheck(BaseModel):
#     rule: str
#     status: str = Field(description="fail, warning, o pass")
#     detail: str

# class EmailAnalysisResponse(BaseModel):
#     score: int = Field(description="Puntaje de riesgo de 0 a 100")
#     category: str = Field(description="Seguro (0-29), Sospechoso (30-69) o Phishing/Malicioso (70-100)")
#     from_visible: str
#     from_real: str
#     subject: str
#     heuristics: List[HeuristicCheck]
#     highlighted_text: List[HighlightChunk]
#     explanation: str = Field(description="Explicación en español simple sobre el nivel de riesgo (RF-09)")


# # --- ESQUEMA PARA GENERAR EL REPORTE PDF ---

# class ReportRequest(BaseModel):
#     score: int
#     category: str
#     from_visible: str
#     from_real: str
#     subject: str
#     heuristics: List[HeuristicCheck]
#     highlighted_text: List[HighlightChunk]
#     explanation: str

# # --- FUNCION DE PARSING DE CORREO (RF-01, RF-02, RF-03) ---
# def parse_email_content(raw_bytes: bytes = None, raw_text: str = None):
#     from_visible = "Desconocido"
#     from_real = "Desconocido"
#     subject = "Sin asunto"
#     body = ""

#     if raw_bytes:
#         msg = email.message_from_bytes(raw_bytes, policy=policy.default)
#         from_visible = msg.get("From", "Desconocido")
#         # Extraer dirección real del Return-Path o Sender si existe
#         from_real = msg.get("Return-Path", msg.get("Sender", from_visible))
#         subject = msg.get("Subject", "Sin asunto")

#         if msg.is_multipart():
#             for part in msg.walk():
#                 content_type = part.get_content_type()
#                 if content_type == "text/plain":
#                     body += part.get_content()
#         else:
#             body = msg.get_content()
#     elif raw_text:
#         body = raw_text
#         # Búsqueda simple de encabezados si pegaron código fuente MIME completo
#         from_match = re.search(r"From:\s*(.+)", raw_text, re.IGNORECASE)
#         subj_match = re.search(r"Subject:\s*(.+)", raw_text, re.IGNORECASE)
#         if from_match:
#             from_visible = from_match.group(1).strip()
#             from_real = from_visible
#         if subj_match:
#             subject = subj_match.group(1).strip()

#     # Detección básica de URLs
#     urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', body)

#     return {
#         "from_visible": from_visible,
#         "from_real": from_real,
#         "subject": subject,
#         "body": body if body else raw_text,
#         "urls": urls
#     }

# # --- GENERADOR DE REPORTES PDF ---

# def generate_pdf_report(data: ReportRequest):

#     buffer = BytesIO()

#     # Configuración del documento
#     pdf = SimpleDocTemplate(
#         buffer,
#         pagesize=A4,
#         rightMargin=2 * cm,
#         leftMargin=2 * cm,
#         topMargin=2 * cm,
#         bottomMargin=2 * cm
#     )

#     styles = getSampleStyleSheet()

#     # Estilos personalizados
#     title_style = ParagraphStyle(
#         "CustomTitle",
#         parent=styles["Title"],
#         fontName="Helvetica-Bold",
#         fontSize=22,
#         textColor=colors.HexColor("#18181B"),
#         alignment=TA_CENTER,
#         spaceAfter=10
#     )

#     subtitle_style = ParagraphStyle(
#         "Subtitle",
#         parent=styles["Normal"],
#         fontSize=10,
#         textColor=colors.HexColor("#71717A"),
#         alignment=TA_CENTER,
#         spaceAfter=20
#     )

#     heading_style = ParagraphStyle(
#         "SectionHeading",
#         parent=styles["Heading2"],
#         fontSize=13,
#         textColor=colors.HexColor("#27272A"),
#         spaceBefore=15,
#         spaceAfter=8
#     )

#     normal_style = ParagraphStyle(
#         "CustomNormal",
#         parent=styles["Normal"],
#         fontName="Helvetica",
#         fontSize=9,
#         leading=14,
#         textColor=colors.HexColor("#3F3F46"),
#         spaceAfter=6,
#         wordWrap="LTR"
#     )

#     story = []

#     # Encabezado
#     story.append(Paragraph("PHISHGUARD AI", title_style))

#     story.append(Paragraph(
#         "REPORTE DE ANALISIS DE SEGURIDAD",
#         subtitle_style
#     ))

#     fecha = datetime.now().strftime("%d/%m/%Y %H:%M:%S")

#     story.append(Paragraph(
#         f"<b>Fecha de generación:</b> {fecha}",
#         normal_style
#     ))

#     story.append(Spacer(1, 15))

#     # Clasificación del riesgo
#     if data.score >= 70:
#         risk_color = colors.HexColor("#DC2626")
#     elif data.score >= 30:
#         risk_color = colors.HexColor("#D97706")
#     else:
#         risk_color = colors.HexColor("#059669")

#     risk_data = [
#         [
#             Paragraph(
#                 "<b>CLASIFICACIÓN DE RIESGO</b>",
#                 normal_style
#             ),
#             Paragraph(
#                 f"<b>{data.score}/100</b>",
#                 ParagraphStyle(
#                     "Score",
#                     parent=normal_style,
#                     fontSize=18,
#                     alignment=TA_CENTER,
#                     textColor=risk_color
#                 )
#             )
#         ],
#         [
#             Paragraph(
#                 escape(data.category),
#                 ParagraphStyle(
#                     "Category",
#                     parent=normal_style,
#                     fontSize=12,
#                     textColor=risk_color
#                 )
#             ),
#             Paragraph("Índice de riesgo", normal_style)
#         ]
#     ]

#     risk_table = Table(
#         risk_data,
#         colWidths=[11 * cm, 5 * cm]
#     )

#     risk_table.setStyle(TableStyle([
#         ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F4F4F5")),
#         ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#D4D4D8")),
#         ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
#         ("ALIGN", (1, 0), (1, -1), "CENTER"),
#         ("LEFTPADDING", (0, 0), (-1, -1), 10),
#         ("RIGHTPADDING", (0, 0), (-1, -1), 10),
#         ("TOPPADDING", (0, 0), (-1, -1), 10),
#         ("BOTTOMPADDING", (0, 0), (-1, -1), 10)
#     ]))

#     story.append(risk_table)

#     # Información del correo
#     story.append(Paragraph(
#         "1. INFORMACIÓN DEL CORREO",
#         heading_style
#     ))

#     email_info = [
#         ["Remitente visible:", data.from_visible],
#         ["Remitente real:", data.from_real],
#         ["Asunto:", data.subject]
#     ]

#     info_table = Table(
#         [
#             [
#                 Paragraph(f"<b>{escape(label)}</b>", normal_style),
#                 Paragraph(escape(str(value)), normal_style)
#             ]
#             for label, value in email_info
#         ],
#         colWidths=[4 * cm, 12 * cm]
#     )

#     info_table.setStyle(TableStyle([
#         ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#F4F4F5")),
#         ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E4E4E7")),
#         ("VALIGN", (0, 0), (-1, -1), "TOP"),
#         ("LEFTPADDING", (0, 0), (-1, -1), 8),
#         ("RIGHTPADDING", (0, 0), (-1, -1), 8),
#         ("TOPPADDING", (0, 0), (-1, -1), 7),
#         ("BOTTOMPADDING", (0, 0), (-1, -1), 7)
#     ]))

#     story.append(info_table)

#     # Explicación del análisis
#     story.append(Paragraph(
#         "2. RESUMEN DEL ANALISIS",
#         heading_style
#     ))

#     story.append(Paragraph(
#         escape(data.explanation).replace("\n", "<br/>"),
#         normal_style
#     ))

#     # Verificaciones heurísticas
#     story.append(Paragraph(
#         "3. VERIFICACIONES HEURISTICAS",
#         heading_style
#     ))

#     heuristic_data = [
#         ["Regla", "Estado", "Detalle"]
#     ]

#     for item in data.heuristics:

#         heuristic_data.append([
#             Paragraph(escape(item.rule), normal_style),
#             Paragraph(
#                 escape(item.status.upper()),
#                 normal_style
#             ),
#             Paragraph(escape(item.detail), normal_style)
#         ])

#     heuristic_table = Table(
#         heuristic_data,
#         colWidths=[4 * cm, 2.5 * cm, 9.5 * cm],
#         repeatRows=1
#     )

#     heuristic_table.setStyle(TableStyle([
#         ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#27272A")),
#         ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
#         ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D4D4D8")),
#         ("VALIGN", (0, 0), (-1, -1), "TOP"),
#         ("LEFTPADDING", (0, 0), (-1, -1), 6),
#         ("RIGHTPADDING", (0, 0), (-1, -1), 6),
#         ("TOPPADDING", (0, 0), (-1, -1), 7),
#         ("BOTTOMPADDING", (0, 0), (-1, -1), 7)
#     ]))

#     story.append(heuristic_table)

#     # Fragmentos del correo analizado
#     story.append(Paragraph(
#         "4. CONTENIDO ANALIZADO",
#         heading_style
#     ))

#     for chunk in data.highlighted_text:

#         if chunk.type == "danger":
#             color = "#DC2626"
#             label = "PELIGRO"
#         elif chunk.type == "warning":
#             color = "#D97706"
#             label = "ADVERTENCIA"
#         else:
#             color = "#3F3F46"
#             label = "NORMAL"

#         chunk_text = escape(chunk.text).replace("\n", "<br/>")

#         paragraph = Paragraph(
#             f'<font color="{color}"><b>[{label}]</b></font> '
#             f'{chunk_text}',
#             normal_style
#         )

#         story.append(paragraph)

#     # Pie de reporte
#     story.append(Spacer(1, 20))

#     story.append(Paragraph(
#         "Reporte generado automáticamente por PhishGuard AI. "
#         "Los resultados constituyen una evaluación asistida por IA "
#         "y deben complementarse con una revisión de seguridad.",
#         ParagraphStyle(
#             "Footer",
#             parent=normal_style,
#             fontSize=8,
#             textColor=colors.HexColor("#71717A"),
#             alignment=TA_CENTER
#         )
#     ))

#     # Construir documento
#     pdf.build(story)

#     buffer.seek(0)

#     return buffer






# # --- ENDPOINT PRINCIPAL DE ANÁLISIS ---
# @app.post("/api/v1/analyze-email", response_model=EmailAnalysisResponse)
# async def analyze_email(
#     text: Optional[str] = Form(None),
#     file: Optional[UploadFile] = File(None),
#     usuario: Usuario = Depends(get_current_user)
# ):
#     if not text and not file:
#         raise HTTPException(status_code=400, detail="Debe proporcionar texto o un archivo .eml")

#     # 1. Parsing
#     raw_bytes = await file.read() if file else None
#     parsed = parse_email_content(raw_bytes=raw_bytes, raw_text=text)

#     if not client:
#         raise HTTPException(status_code=500, detail="GEMINI_API_KEY no configurada en el archivo .env")

#     # 2. Prompt estructurado para Gemini (RF-04, RF-05, RF-06, RF-07, RF-08, RF-09)
#     prompt = f"""
#     Actúa como un experto en ciberseguridad especializado en análisis de Phishing e Ingeniería Social.
#     Analiza el siguiente correo electrónico:

#     METADATOS:
#     - Remitente Visible: {parsed['from_visible']}
#     - Remitente Real / Return-Path: {parsed['from_real']}
#     - Asunto: {parsed['subject']}
#     - URLs detectadas: {parsed['urls']}

#     CUERPO DEL CORREO:
#     {parsed['body']}

#     INSTRUCCIONES EVALUACIÓN:
#     1. Evalúa si hay discrepancias entre remitente visible y real, o uso de acortadores/dominios sospechosos.
#     2. Identifica patrones de ingeniería social (urgencia, coerción, suplantación de identidad, solicitudes de datos).
#     3. Calcula un 'score' de riesgo global de 0 a 100.
#     4. Clasifica la categoría en: 'Seguro (0-29)', 'Sospechoso (30-69)' o 'Phishing/Malicioso (70-100)'.
#     5. Divide el cuerpo del correo en fragmentos ('highlighted_text') asignando a cada fragmento el tipo:
#        - 'normal': Texto neutro.
#        - 'warning': Puntos de atención leve o duda.
#        - 'danger': Fragmentos altamente maliciosos, amenazas, links engañosos o llamadas de urgencia.
#     6. Proporciona una explicación concisa en español simple (XAI) de por qué se asignó ese puntaje.
#     """

#     try:
#         # Llamada a la API usando Structured Outputs
#         response = client.models.generate_content(
#             model='gemini-3.6-flash',
#             contents=prompt,
#             config=types.GenerateContentConfig(
#                 response_mime_type="application/json",
#                 response_schema=EmailAnalysisResponse,
#                 temperature=0.1,
#             ),
#         )
        
#         # FastAPI y Pydantic deserializan automáticamente el JSON devuelto
#         import json
#         result_dict = json.loads(response.text)
#         return result_dict

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error en el análisis del LLM: {str(e)}")



# # --- ENDPOINT PARA GENERAR Y DESCARGAR EL REPORTE PDF ---

# @app.post("/api/v1/generate-report")
# async def download_report(
#     data: ReportRequest,
#     usuario: Usuario = Depends(get_current_user)
# ):

#     try:

#         pdf_buffer = generate_pdf_report(data)

#         filename = "PhishGuard_Reporte.pdf"

#         return StreamingResponse(
#             pdf_buffer,
#             media_type="application/pdf",
#             headers={
#                 "Content-Disposition": f'attachment; filename="{filename}"'
#             }
#         )

#     except Exception as e:

#         raise HTTPException(
#             status_code=500,
#             detail=f"Error al generar el reporte PDF: {str(e)}"
#         )


import os
import re
import email
import json
import random
import time
from email import policy
from io import BytesIO
from datetime import datetime
from xml.sax.saxutils import escape
from typing import List, Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from google import genai
from google.genai import types

# ReportLab imports
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle
)

# Conexión a Base de Datos y Modelos
from sqlalchemy.orm import Session
from database import get_db
from models import Usuario, AnalisisCorreo
from auth import get_current_user
from auth import router as auth_router

load_dotenv()

# Inicializar cliente de Gemini usando el SDK oficial actual
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

app = FastAPI(title="PhishGuard AI Backend")

# CONFIGURACION CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# RUTAS DE AUTENTICACION
app.include_router(auth_router)

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


# --- ESQUEMA PARA GENERAR EL REPORTE PDF ---
class ReportRequest(BaseModel):
    score: int
    category: str
    from_visible: str
    from_real: str
    subject: str
    heuristics: List[HeuristicCheck]
    highlighted_text: List[HighlightChunk]
    explanation: str

# --- FUNCION DE PARSING DE CORREO (RF-01, RF-02, RF-03) ---
def parse_email_content(raw_bytes: bytes = None, raw_text: str = None):
    from_visible = "Desconocido"
    from_real = "Desconocido"
    subject = "Sin asunto"
    body = ""

    if raw_bytes:
        msg = email.message_from_bytes(raw_bytes, policy=policy.default)
        from_visible = msg.get("From", "Desconocido")
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
        from_match = re.search(r"From:\s*(.+)", raw_text, re.IGNORECASE)
        subj_match = re.search(r"Subject:\s*(.+)", raw_text, re.IGNORECASE)
        if from_match:
            from_visible = from_match.group(1).strip()
            from_real = from_visible
        if subj_match:
            subject = subj_match.group(1).strip()

    urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', body)

    return {
        "from_visible": from_visible,
        "from_real": from_real,
        "subject": subject,
        "body": body if body else raw_text,
        "urls": urls
    }

# --- GENERADOR DE REPORTES PDF ---
def generate_pdf_report(data: ReportRequest):
    buffer = BytesIO()

    pdf = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=22,
        textColor=colors.HexColor("#18181B"),
        alignment=TA_CENTER,
        spaceAfter=10
    )

    subtitle_style = ParagraphStyle(
        "Subtitle",
        parent=styles["Normal"],
        fontSize=10,
        textColor=colors.HexColor("#71717A"),
        alignment=TA_CENTER,
        spaceAfter=20
    )

    heading_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontSize=13,
        textColor=colors.HexColor("#27272A"),
        spaceBefore=15,
        spaceAfter=8
    )

    normal_style = ParagraphStyle(
        "CustomNormal",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=14,
        textColor=colors.HexColor("#3F3F46"),
        spaceAfter=6,
        wordWrap="LTR"
    )

    story = []

    story.append(Paragraph("PHISHGUARD AI", title_style))
    story.append(Paragraph("REPORTE DE ANALISIS DE SEGURIDAD", subtitle_style))

    fecha = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    story.append(Paragraph(f"<b>Fecha de generación:</b> {fecha}", normal_style))
    story.append(Spacer(1, 15))

    if data.score >= 70:
        risk_color = colors.HexColor("#DC2626")
    elif data.score >= 30:
        risk_color = colors.HexColor("#D97706")
    else:
        risk_color = colors.HexColor("#059669")

    risk_data = [
        [
            Paragraph("<b>CLASIFICACIÓN DE RIESGO</b>", normal_style),
            Paragraph(f"<b>{data.score}/100</b>", ParagraphStyle(
                "Score",
                parent=normal_style,
                fontSize=18,
                alignment=TA_CENTER,
                textColor=risk_color
            ))
        ],
        [
            Paragraph(escape(data.category), ParagraphStyle(
                "Category",
                parent=normal_style,
                fontSize=12,
                textColor=risk_color
            )),
            Paragraph("Índice de riesgo", normal_style)
        ]
    ]

    risk_table = Table(risk_data, colWidths=[11 * cm, 5 * cm])
    risk_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F4F4F5")),
        ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#D4D4D8")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (1, 0), (1, -1), "CENTER"),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10)
    ]))

    story.append(risk_table)

    story.append(Paragraph("1. INFORMACIÓN DEL CORREO", heading_style))

    email_info = [
        ["Remitente visible:", data.from_visible],
        ["Remitente real:", data.from_real],
        ["Asunto:", data.subject]
    ]

    info_table = Table(
        [
            [
                Paragraph(f"<b>{escape(label)}</b>", normal_style),
                Paragraph(escape(str(value)), normal_style)
            ]
            for label, value in email_info
        ],
        colWidths=[4 * cm, 12 * cm]
    )

    info_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#F4F4F5")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E4E4E7")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7)
    ]))

    story.append(info_table)

    story.append(Paragraph("2. RESUMEN DEL ANALISIS", heading_style))
    story.append(Paragraph(escape(data.explanation).replace("\n", "<br/>"), normal_style))

    story.append(Paragraph("3. VERIFICACIONES HEURISTICAS", heading_style))

    heuristic_data = [["Regla", "Estado", "Detalle"]]
    for item in data.heuristics:
        heuristic_data.append([
            Paragraph(escape(item.rule), normal_style),
            Paragraph(escape(item.status.upper()), normal_style),
            Paragraph(escape(item.detail), normal_style)
        ])

    heuristic_table = Table(heuristic_data, colWidths=[4 * cm, 2.5 * cm, 9.5 * cm], repeatRows=1)
    heuristic_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#27272A")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D4D4D8")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7)
    ]))

    story.append(heuristic_table)

    story.append(Paragraph("4. CONTENIDO ANALIZADO", heading_style))

    for chunk in data.highlighted_text:
        if chunk.type == "danger":
            color = "#DC2626"
            label = "PELIGRO"
        elif chunk.type == "warning":
            color = "#D97706"
            label = "ADVERTENCIA"
        else:
            color = "#3F3F46"
            label = "NORMAL"

        chunk_text = escape(chunk.text).replace("\n", "<br/>")

        paragraph = Paragraph(
            f'<font color="{color}"><b>[{label}]</b></font> {chunk_text}',
            normal_style
        )
        story.append(paragraph)

    story.append(Spacer(1, 20))
    story.append(Paragraph(
        "Reporte generado automáticamente por PhishGuard AI. "
        "Los resultados constituyen una evaluación asistida por IA "
        "y deben complementarse con una revisión de seguridad.",
        ParagraphStyle(
            "Footer",
            parent=normal_style,
            fontSize=8,
            textColor=colors.HexColor("#71717A"),
            alignment=TA_CENTER
        )
    ))

    pdf.build(story)
    buffer.seek(0)
    return buffer


# --- ENDPOINT PRINCIPAL DE ANÁLISIS ---
# @app.post("/api/v1/analyze-email", response_model=EmailAnalysisResponse)


# -----------EL BUENO---------------------
@app.post("/api/v1/analyze-email")
async def analyze_email(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    usuario: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not text and not file:
        raise HTTPException(status_code=400, detail="Debe proporcionar texto o un archivo .eml")

    # 1. Parsing del correo y lectura de bytes
    raw_bytes = await file.read() if file else None
    parsed = parse_email_content(raw_bytes=raw_bytes, raw_text=text)

    if not client:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY no configurada en el archivo .env")

    # 2. Prompt estructurado para Gemini
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

        result_dict = json.loads(response.text)

        # 3. Determinar el tipo de ingesta
        if file:
            filename_lower = file.filename.lower() if file.filename else ""
            if filename_lower.endswith(".msg"):
                tipo_ingesta = "ARCHIVO_MSG"
            else:
                tipo_ingesta = "ARCHIVO_EML"
        else:
            tipo_ingesta = "TEXTO_PLANO"

        # 4. Guardar registro en la base de datos MySQL (analisis_correos)
        nuevo_analisis = AnalisisCorreo(
            usuario_id=usuario.id,
            remitente_visible=result_dict.get("from_visible"),
            remitente_real=result_dict.get("from_real"),
            asunto=result_dict.get("subject"),
            tipo_ingesta=tipo_ingesta,
            cuerpo_texto=parsed.get("body"),
            nombre_archivo_original=file.filename if file else None,
            archivo_binario=raw_bytes if file else None,
            score_riesgo=result_dict.get("score"),
            categoria=result_dict.get("category"),
            explicacion_xai=result_dict.get("explanation"),
            resultado_json_completo=result_dict
        )

        db.add(nuevo_analisis)
        db.commit()
        db.refresh(nuevo_analisis)

        # return result_dict
        return {
            **result_dict,
            "analysis_id": nuevo_analisis.id
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error en el análisis del LLM o persistencia: {str(e)}")

# --- ENDPOINT PRINCIPAL DE ANÁLISIS CON BACKOFF EXPONENCIAL ---
# @app.post("/api/v1/analyze-email")
# async def analyze_email(
#     text: Optional[str] = Form(None),
#     file: Optional[UploadFile] = File(None),
#     usuario: Usuario = Depends(get_current_user),
#     db: Session = Depends(get_db)
# ):
#     if not text and not file:
#         raise HTTPException(status_code=400, detail="Debe proporcionar texto o un archivo .eml")

#     # 1. Parsing del correo y lectura de bytes
#     raw_bytes = await file.read() if file else None
#     parsed = parse_email_content(raw_bytes=raw_bytes, raw_text=text)

#     if not client:
#         raise HTTPException(status_code=500, detail="GEMINI_API_KEY no configurada en el archivo .env")

#     # 2. Prompt estructurado para Gemini
#     prompt = f"""
#     Actúa como un experto en ciberseguridad especializado en análisis de Phishing e Ingeniería Social.
#     Analiza el siguiente correo electrónico:

#     METADATOS:
#     - Remitente Visible: {parsed['from_visible']}
#     - Remitente Real / Return-Path: {parsed['from_real']}
#     - Asunto: {parsed['subject']}
#     - URLs detectadas: {parsed['urls']}

#     CUERPO DEL CORREO:
#     {parsed['body']}

#     INSTRUCCIONES EVALUACIÓN:
#     1. Evalúa si hay discrepancias entre remitente visible y real, o uso de acortadores/dominios sospechosos.
#     2. Identifica patrones de ingeniería social (urgencia, coerción, suplantación de identidad, solicitudes de datos).
#     3. Calcula un 'score' de riesgo global de 0 a 100.
#     4. Clasifica la categoría en: 'Seguro (0-29)', 'Sospechoso (30-69)' o 'Phishing/Malicioso (70-100)'.
#     5. Divide el cuerpo del correo en fragmentos ('highlighted_text') asignando a cada fragmento el tipo:
#        - 'normal': Texto neutro.
#        - 'warning': Puntos de atención leve o duda.
#        - 'danger': Fragmentos altamente maliciosos, amenazas, links engañosos o llamadas de urgencia.
#     6. Proporciona una explicación concisa en español simple (XAI) de por qué se asignó ese puntaje.
#     """

#     # --- CONFIGURACIÓN DE REINTENTOS CON BACKOFF EXPONENCIAL ---
#     max_retries = 3
#     base_delay = 2  # Segundos iniciales de espera
#     response = None

#     for attempt in range(max_retries + 1):
#         try:
#             # Llamada a la API usando Structured Outputs
#             response = client.models.generate_content(
#                 model='gemini-3.6-flash', # NOTA: Asegúrate de usar un modelo vigente y soportado
#                 contents=prompt,
#                 config=types.GenerateContentConfig(
#                     response_mime_type="application/json",
#                     response_schema=EmailAnalysisResponse,
#                     temperature=0.1,
#                 ),
#             )
#             # Si la llamada es exitosa, salimos del bucle
#             break
#         except Exception as e:
#             error_str = str(e)
#             # Verificamos si el error corresponde a un 503 o alta demanda/saturación
#             is_overloaded = "503" in error_str or "UNAVAILABLE" in error_str or "high demand" in error_str.lower()
            
#             if is_overloaded and attempt < max_retries:
#                 # Calcular tiempo de espera exponencial con un poco de aleatoriedad (jitter) para evitar congestión concurrente
#                 delay = (base_delay ** attempt) + random.uniform(0.1, 1.0)
#                 time.sleep(delay)
#                 continue
#             else:
#                 # Si se agotaron los intentos o es otro tipo de error crítico, lo propagamos
#                 if attempt == max_retries:
#                     raise HTTPException(
#                         status_code=503, 
#                         detail=f"El servicio de IA está experimentando alta demanda tras {max_retries} reintentos. Inténtalo más tarde. Detalle: {error_str}"
#                     )
#                 raise e

#     try:
#         result_dict = json.loads(response.text)

#         # 3. Determinar el tipo de ingesta
#         if file:
#             filename_lower = file.filename.lower() if file.filename else ""
#             if filename_lower.endswith(".msg"):
#                 tipo_ingesta = "ARCHIVO_MSG"
#             else:
#                 tipo_ingesta = "ARCHIVO_EML"
#         else:
#             tipo_ingesta = "TEXTO_PLANO"

#         # 4. Guardar registro en la base de datos MySQL (analisis_correos)
#         nuevo_analisis = AnalisisCorreo(
#             usuario_id=usuario.id,
#             remitente_visible=result_dict.get("from_visible"),
#             remitente_real=result_dict.get("from_real"),
#             asunto=result_dict.get("subject"),
#             tipo_ingesta=tipo_ingesta,
#             cuerpo_texto=parsed.get("body"),
#             nombre_archivo_original=file.filename if file else None,
#             archivo_binario=raw_bytes if file else None,
#             score_riesgo=result_dict.get("score"),
#             categoria=result_dict.get("category"),
#             explicacion_xai=result_dict.get("explanation"),
#             resultado_json_completo=result_dict
#         )

#         db.add(nuevo_analisis)
#         db.commit()
#         db.refresh(nuevo_analisis)

#         return {
#             **result_dict,
#             "analysis_id": nuevo_analisis.id
#         }

#     except Exception as e:
#         db.rollback()
#         raise HTTPException(status_code=500, detail=f"Error en el análisis del LLM o persistencia: {str(e)}")


# --- HISTORIAL DE ANALISIS DE CORREOS ---
@app.get("/api/v1/email-history")
async def get_email_history(
    usuario: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        historial = (
            db.query(AnalisisCorreo)
            .filter(AnalisisCorreo.usuario_id == usuario.id)
            .order_by(AnalisisCorreo.fecha_analisis.desc())
            .all()
        )

        return [
            {
                "id": item.id,
                "subject": item.asunto or "Sin asunto",
                "from_visible": item.remitente_visible or "Desconocido",
                "from_real": item.remitente_real or "Desconocido",
                "score": item.score_riesgo,
                "category": item.categoria,
                "date": (
                    item.fecha_analisis.isoformat()
                    if item.fecha_analisis else None
                ),
                "filename": item.nombre_archivo_original,
                "ingestion_type": item.tipo_ingesta
            }
            for item in historial
        ]

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener el historial: {str(e)}"
        )

# --- HISTORIAL DE ANALISIS DE CORREOS ---

@app.get("/api/v1/email-history")
async def get_email_history(
    usuario: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Obtener únicamente los análisis pertenecientes al usuario autenticado
        historial = (
            db.query(AnalisisCorreo)
            .filter(AnalisisCorreo.usuario_id == usuario.id)
            .order_by(AnalisisCorreo.fecha_analisis.desc())
            .all()
        )

        return [
            {
                "id": item.id,
                "subject": item.asunto or "Sin asunto",
                "from_visible": item.remitente_visible or "Desconocido",
                "from_real": item.remitente_real or "Desconocido",
                "score": item.score_riesgo,
                "category": item.categoria,
                "date": (
                    item.fecha_analisis.isoformat()
                    if item.fecha_analisis else None
                ),
                "filename": item.nombre_archivo_original,
                "ingestion_type": item.tipo_ingesta
            }
            for item in historial
        ]

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener el historial: {str(e)}"
        )


# --- OBTENER UN ANALISIS ESPECIFICO DEL HISTORIAL ---

@app.get("/api/v1/email-history/{analysis_id}")
async def get_email_analysis(
    analysis_id: int,
    usuario: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Buscar el análisis y comprobar que pertenece al usuario autenticado
        analisis = (
            db.query(AnalisisCorreo)
            .filter(
                AnalisisCorreo.id == analysis_id,
                AnalisisCorreo.usuario_id == usuario.id
            )
            .first()
        )

        if not analisis:
            raise HTTPException(
                status_code=404,
                detail="Análisis no encontrado o no tienes permiso para consultarlo."
            )

        return {
            "id": analisis.id,
            "score": analisis.score_riesgo,
            "category": analisis.categoria,
            "from_visible": analisis.remitente_visible,
            "from_real": analisis.remitente_real,
            "subject": analisis.asunto,
            "heuristics": analisis.resultado_json_completo.get("heuristics", []),
            "highlighted_text": analisis.resultado_json_completo.get("highlighted_text", []),
            "explanation": analisis.explicacion_xai,
            "body": analisis.cuerpo_texto,
            "date": (
                analisis.fecha_analisis.isoformat()
                if analisis.fecha_analisis else None
            ),
            "filename": analisis.nombre_archivo_original,
            "ingestion_type": analisis.tipo_ingesta
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al recuperar el análisis: {str(e)}"
        )




# --- ENDPOINT PARA GENERAR Y DESCARGAR EL REPORTE PDF ---
@app.post("/api/v1/generate-report")
async def download_report(
    data: ReportRequest,
    usuario: Usuario = Depends(get_current_user)
):
    try:
        pdf_buffer = generate_pdf_report(data)
        filename = "PhishGuard_Reporte.pdf"

        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al generar el reporte PDF: {str(e)}"
        )