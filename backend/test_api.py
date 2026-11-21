import os
from dotenv import load_dotenv
from google import genai

load_dotenv()  # Carga el archivo .env

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

response = client.models.generate_content(
    model="gemini-3.6-flash",
    # model="gemini-1.5-flash",
    contents="Hola, responde 'OK' si la API Key funciona."
)
print(response.text)