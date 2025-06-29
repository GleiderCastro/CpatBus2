import os
import tempfile
import asyncio
import cv2
from ultralytics import YOLO
from fastapi import FastAPI, UploadFile, File, WebSocket, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse, JSONResponse
from firebase_admin import credentials, initialize_app, db
from passlib.context import CryptContext
from jose import jwt, JWTError
from dotenv import load_dotenv

# Pydantic schema para login en JSON
from schemas import LoginRequest    

# Carga variables de entorno
load_dotenv()

# --- Configuración Firebase ---
FIREBASE_DB_URL = os.getenv("FIREBASE_DATABASE_URL")
cred = credentials.Certificate("firebase_credentials.json")
initialize_app(cred, {"databaseURL": FIREBASE_DB_URL})

# --- Configuración JWT / Auth ---
SECRET_KEY = os.getenv("JWT_SECRET", "changeme")
ALGORITHM  = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Verificación de contraseña y creación de token
def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_token(username: str) -> str:
    to_encode = {"sub": username}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# --- FastAPI App ---
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Carga del modelo YOLO ---
MODEL    = YOLO("model/best.pt")
CAPACITY = int(os.getenv("BUS_CAPACITY", 30))

# --- Función para procesar el video ---
def gen_mjpeg(file_path: str):
    cap = cv2.VideoCapture(file_path)
    output_dir = os.path.join(os.path.dirname(__file__), "videos_procesados")
    os.makedirs(output_dir, exist_ok=True)
    base_name = os.path.splitext(os.path.basename(file_path))[0]
    output_path = os.path.join(output_dir, f"{base_name}_procesado.mp4")
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    fps = cap.get(cv2.CAP_PROP_FPS) or 25
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    frame_count = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        results = MODEL(frame, imgsz=640, conf=0.3)[0]
        annotated = results.plot()

        if annotated.shape[1] != width or annotated.shape[0] != height:
            annotated = cv2.resize(annotated, (width, height))
        if len(annotated.shape) == 2 or (len(annotated.shape) == 3 and annotated.shape[2] == 1):
            annotated = cv2.cvtColor(annotated, cv2.COLOR_GRAY2BGR)
        if len(annotated.shape) == 3 and annotated.shape[2] == 4:
            annotated = cv2.cvtColor(annotated, cv2.COLOR_BGRA2BGR)

        out.write(annotated)
        frame_count += 1

        count = int((results.boxes.cls == 0).sum())
        gen_mjpeg.latest_count = count
        _, buf = cv2.imencode(".jpg", annotated)
        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n" +
            buf.tobytes() +
            b"\r\n"
        )
    cap.release()
    out.release()
    return output_path

# --- WebSocket para el conteo en tiempo real ---
@app.websocket("/model/counts")
async def ws_counts(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            await asyncio.sleep(0.5)
            c = getattr(gen_mjpeg, "latest_count", 0)
            status = "OK"
            if c > CAPACITY:   status = "SOBREAFORO"
            elif c == CAPACITY: status = "LLENO"
            await ws.send_json({"count": c, "status": status})
    except Exception as e:
        print(f"[DEBUG] WebSocket cerrado: {e}")

# --- Endpoint para obtener el último video procesado ---
@app.get("/model/processed/latest")
async def get_latest_processed_video():
    output_dir = os.path.join(os.path.dirname(__file__), "videos_procesados")
    files = os.listdir(output_dir)
    if not files:
        raise HTTPException(status_code=404, detail="No hay videos procesados")
    
    latest_video = max(files, key=lambda x: os.path.getctime(os.path.join(output_dir, x)))  # Obtener el más reciente
    return {"filename": latest_video}

# --- Endpoint para procesar el video ---
@app.post("/model/process")
async def process_video(video: UploadFile = File(...)):
    suffix = os.path.splitext(video.filename)[1]
    tmpf = tempfile.NamedTemporaryFile(suffix=suffix, delete=False)
    tmpf.write(await video.read())
    tmpf.flush(); tmpf.close()

    # Procesa el video y guarda el archivo procesado (mantener esta línea)
    processed_video_path = gen_mjpeg(tmpf.name)

    # Extrae el nombre del archivo procesado
    base_name = os.path.splitext(os.path.basename(tmpf.name))[0]
    processed_filename = f"{base_name}_procesado.mp4"

    # Aseguramos que se envíe correctamente el nombre del video procesado
    return JSONResponse({"processed_filename": processed_filename})


# --- Endpoint para servir el video procesado (GET y HEAD) ---
from fastapi import Request, Response

@app.api_route("/model/processed/{filename}", methods=["GET", "HEAD"])
async def get_processed_video(filename: str, request: Request):
    output_dir = os.path.join(os.path.dirname(__file__), "videos_procesados")
    file_path = os.path.join(output_dir, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    if request.method == "HEAD":
        return Response(status_code=200)
    return FileResponse(file_path, media_type="video/mp4", filename=filename)

@app.post("/model/test-stream")
async def test_stream(video: UploadFile = File(...)):
    suffix = os.path.splitext(video.filename)[1]
    tmpf = tempfile.NamedTemporaryFile(suffix=suffix, delete=False)
    tmpf.write(await video.read())
    tmpf.flush(); tmpf.close()
    # Devuelve el stream MJPEG generado
    return StreamingResponse(gen_mjpeg(tmpf.name), media_type="multipart/x-mixed-replace; boundary=frame")
