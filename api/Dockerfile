# api/Dockerfile

# 1) Imagen base ligera con Python 3.10
FROM python:3.10-slim

LABEL maintainer="tu-email@ejemplo.com"

WORKDIR /app

# 2) Instala dependencias de sistema (OpenCV + CA certs)
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    ca-certificates \
  && update-ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# 3) Copia e instala las dependencias de Python
COPY requirements.txt .
# Opcionalmente, actualiza pip por si la versión del contenedor es muy antigua
RUN pip install --upgrade pip \
 && pip install --no-cache-dir \
    --trusted-host pypi.org \
    --trusted-host files.pythonhosted.org \
    -r requirements.txt

# 4) Copia el resto del código, el .env y tus credenciales
COPY . .

# 5) Exponer el puerto de FastAPI
EXPOSE 8000

# 6) Crear usuario no root y dar permisos
RUN useradd --create-home appuser \
 && chown -R appuser:appuser /app
USER appuser

# 7) Comando de arranque
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
