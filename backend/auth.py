
import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Response, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from database import get_db
from models import Usuario


load_dotenv()

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Autenticacion"]
)

# CONFIGURACION
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

SECRET_KEY = os.getenv("SESSION_SECRET_KEY")
ALGORITHM = "HS256"

SESSION_EXPIRE_MINUTES = int(
    os.getenv("SESSION_EXPIRE_MINUTES", "10080")
)

COOKIE_SECURE = os.getenv(
    "COOKIE_SECURE", "false"
).lower() == "true"

COOKIE_NAME = "phishguard_session"


# MODELO DE ENTRADA
class GoogleLoginRequest(BaseModel):
    id_token: str


# CREAR TOKEN DE SESION
def create_session_token(user_id: int):

    expiration = datetime.now(timezone.utc) + timedelta(
        minutes=SESSION_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "exp": expiration
    }

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


# OBTENER USUARIO AUTENTICADO
def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
):

    token = request.cookies.get(COOKIE_NAME)

    if not token:
        raise HTTPException(
            status_code=401,
            detail="No hay una sesion activa"
        )

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = int(payload.get("sub"))

    except (JWTError, ValueError, TypeError):

        raise HTTPException(
            status_code=401,
            detail="Sesion invalida o expirada"
        )

    user = db.query(Usuario).filter(
        Usuario.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Usuario no encontrado"
        )

    return user


# ==========================================
# REGISTRO / INICIO DE SESION CON GOOGLE
# ==========================================

@router.post("/google")
def google_login(
    data: GoogleLoginRequest,
    response: Response,
    db: Session = Depends(get_db)
):

    if not GOOGLE_CLIENT_ID or not SECRET_KEY:
        raise HTTPException(
            status_code=500,
            detail="Configuracion de autenticacion incompleta"
        )

    # 1. VERIFICAR TOKEN DE GOOGLE
    try:

        google_user = id_token.verify_oauth2_token(
            data.id_token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )

    except ValueError:

        raise HTTPException(
            status_code=401,
            detail="El token de Google no es valido"
        )

    # 2. EXTRAER INFORMACION VERIFICADA
    google_id = google_user.get("sub")
    nombre = google_user.get("name")
    email = google_user.get("email")
    avatar_url = google_user.get("picture")

    email_verified = google_user.get("email_verified", False)

    if not google_id or not nombre or not email:
        raise HTTPException(
            status_code=400,
            detail="Google no proporciono los datos necesarios"
        )

    if not email_verified:
        raise HTTPException(
            status_code=401,
            detail="El correo de Google no esta verificado"
        )

    # 3. BUSCAR USUARIO POR GOOGLE ID
    usuario = db.query(Usuario).filter(
        Usuario.google_id == google_id
    ).first()

    if usuario:

        # USUARIO EXISTENTE: ACTUALIZAR DATOS
        usuario.nombre = nombre
        usuario.email = email
        usuario.avatar_url = avatar_url
        usuario.ultimo_acceso = datetime.now()

        mensaje = "Inicio de sesion exitoso"

    else:

        # 4. COMPROBAR SI EL CORREO YA EXISTE
        email_existente = db.query(Usuario).filter(
            Usuario.email == email
        ).first()

        if email_existente:
            raise HTTPException(
                status_code=409,
                detail="Este correo ya esta asociado a otra cuenta"
            )

        # 5. REGISTRAR NUEVO USUARIO
        usuario = Usuario(
            google_id=google_id,
            nombre=nombre,
            email=email,
            avatar_url=avatar_url
        )

        db.add(usuario)

        mensaje = "Usuario registrado correctamente"

    # 6. GUARDAR EN MYSQL
    try:

        db.commit()
        db.refresh(usuario)

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="No se pudo guardar el usuario"
        )

    # 7. CREAR SESION
    session_token = create_session_token(usuario.id)

    # 8. GUARDAR TOKEN EN COOKIE HTTP-ONLY
    response.set_cookie(
        key=COOKIE_NAME,
        value=session_token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=SESSION_EXPIRE_MINUTES * 60,
        path="/"
    )

    return {
        "message": mensaje,
        "user": {
            "id": usuario.id,
            "google_id": usuario.google_id,
            "nombre": usuario.nombre,
            "email": usuario.email,
            "avatar_url": usuario.avatar_url
        }
    }


# ==========================================
# CONSULTAR SESION ACTUAL
# ==========================================

@router.get("/me")
def get_me(
    usuario: Usuario = Depends(get_current_user)
):

    return {
        "authenticated": True,
        "user": {
            "id": usuario.id,
            "google_id": usuario.google_id,
            "nombre": usuario.nombre,
            "email": usuario.email,
            "avatar_url": usuario.avatar_url
        }
    }


# ==========================================
# CERRAR SESION
# ==========================================

@router.post("/logout")
def logout(response: Response):

    response.delete_cookie(
        key=COOKIE_NAME,
        path="/",
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax"
    )

    return {
        "message": "Sesion cerrada correctamente"
    }
