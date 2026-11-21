
# from sqlalchemy import (
#     Column,
#     Integer,
#     String,
#     Text,
#     DateTime,
#     func
# )

# from database import Base



# class Usuario(Base):

#     __tablename__ = "usuarios"

#     id = Column(
#         Integer,
#         primary_key=True,
#         autoincrement=True
#     )

#     google_id = Column(
#         String(255),
#         unique=True,
#         nullable=False
#     )

#     nombre = Column(
#         String(150),
#         nullable=False
#     )

#     email = Column(
#         String(255),
#         unique=True,
#         nullable=False
#     )

#     avatar_url = Column(
#         Text,
#         nullable=True
#     )

#     fecha_registro = Column(
#         DateTime,
#         server_default=func.current_timestamp()
#     )

#     ultimo_acceso = Column(
#         DateTime,
#         server_default=func.current_timestamp(),
#         onupdate=func.current_timestamp()
#     )

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Enum,
    LargeBinary,
    JSON,
    ForeignKey,
    func
)
from sqlalchemy.orm import relationship
from database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    google_id = Column(
        String(255),
        unique=True,
        nullable=False
    )

    nombre = Column(
        String(150),
        nullable=False
    )

    email = Column(
        String(255),
        unique=True,
        nullable=False
    )

    avatar_url = Column(
        Text,
        nullable=True
    )

    fecha_registro = Column(
        DateTime,
        server_default=func.current_timestamp()
    )

    ultimo_acceso = Column(
        DateTime,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp()
    )

    # Relación uno-a-muchos con análisis de correos
    analisis = relationship("AnalisisCorreo", back_populates="usuario")


class AnalisisCorreo(Base):
    __tablename__ = "analisis_correos"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id", ondelete="SET NULL"),
        nullable=True
    )

    # Metadatos extraídos
    remitente_visible = Column(String(255), nullable=True)
    remitente_real = Column(String(255), nullable=True)
    asunto = Column(String(255), nullable=True)

    # Ingesta
    tipo_ingesta = Column(
        Enum('TEXTO_PLANO', 'MIME_RAW', 'ARCHIVO_EML', 'ARCHIVO_MSG', name='tipo_ingesta_enum'),
        nullable=False,
        default='TEXTO_PLANO'
    )
    cuerpo_texto = Column(Text, nullable=True)
    nombre_archivo_original = Column(String(255), nullable=True)
    archivo_binario = Column(LargeBinary, nullable=True)

    # Resultados del Análisis (Gemini)
    score_riesgo = Column(Integer, nullable=False)
    categoria = Column(
        Enum('Seguro (0-29)', 'Sospechoso (30-69)', 'Phishing/Malicioso (70-100)', name='categoria_enum'),
        nullable=False
    )
    explicacion_xai = Column(Text, nullable=False)
    resultado_json_completo = Column(JSON, nullable=False)

    fecha_analisis = Column(
        DateTime,
        server_default=func.current_timestamp()
    )

    # Relación inversa con Usuario
    usuario = relationship("Usuario", back_populates="analisis")