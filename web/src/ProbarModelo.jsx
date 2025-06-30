import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProbarModelo.css";

const API_URL = "http://localhost:8000"; // Dirección de tu API

const ProbarModelo = () => {
  const navigate = useNavigate();
  /* ---------- estado ---------- */
  const [streamURL, setStreamURL] = useState(null);
  const [videoURL, setVideoURL] = useState(null); // para MP4 final
  const [peopleCount, setPeopleCount] = useState(0);
  const [maxCapacity, setMaxCapacity] = useState(30);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const wsRef = useRef(null);

  /* ---------- cleanup ---------- */
  useEffect(() => {
    // Al recargar la página, buscar el último video procesado
    const fetchLastProcessedVideo = async () => {
      try {
        const res = await fetch(`${API_URL}/model/processed/latest`); // Endpoint para obtener el último video procesado
        if (res.ok) {
          const data = await res.json();
          if (data && data.filename) {
            setVideoURL(`${API_URL}/model/processed/${data.filename}`); // Establece la URL del video procesado
          }
        }
      } catch (error) {
        console.error("Error al obtener el último video procesado:", error);
      }
    };

    fetchLastProcessedVideo();

    return () => { if (wsRef.current) wsRef.current.close(); };
  }, []);

  // Polling para saber si el video procesado ya está disponible
  const waitForVideo = (url) => {
    setProcessing(true);
    setShowSuccess(false);
    let fakeProgress = 0;
    const check = async () => {
      try {
        const res = await fetch(url, { method: "HEAD" });
        if (res.ok) {
          setProcessing(false);
          setStreamURL(null);
          setShowSuccess(true);
          setProgress(100);
          if (wsRef.current) wsRef.current.close();
        } else {
          fakeProgress = Math.min(fakeProgress + Math.random() * 7, 98);
          setProgress(Math.floor(fakeProgress));
          setTimeout(check, 1000);
        }
      } catch {
        setTimeout(check, 1000);
      }
    };
    check();
  };

  /* ---------- manejador de carga ---------- */
  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setStreamURL(null);            // reinicia vista
      setVideoURL(null);
      setPeopleCount(0);
      setProgress(0);
      setShowSuccess(false);

      // 1) Lanza el MJPEG con POST /model/test-stream
      const formData = new FormData();
      formData.append("video", file);
      fetch(`${API_URL}/model/test-stream`, {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          setStreamURL(`${API_URL}/model/test-stream`);
        })
        .catch((error) => {
          console.error("Error uploading video:", error);
        });

      // 2) Abre WebSocket de conteo (como en el código que sí funciona)
      if (wsRef.current) {
        wsRef.current.close();
      }
      const ws = new WebSocket(`${API_URL.replace("http", "ws")}/model/counts`);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setPeopleCount(data.count);
      };
      wsRef.current = ws;

      // 3) Procesa el video y muestra el resultado final (mantener resto de lógica)
      const formProc = new FormData();
      formProc.append("video", file);
      fetch(`${API_URL}/model/process`, { method: "POST", body: formProc })
        .then(async (r) => {
          const { processed_filename } = await r.json();
          const processedURL = `${API_URL}/model/processed/${processed_filename}`;
          setVideoURL(processedURL);
          waitForVideo(processedURL);
        });
    }
  };

  const handleMaxCapacityChange = (event) => {
    setMaxCapacity(event.target.value);
  };

  return (
    <div className="probar-modelo-container">
      <nav className="navbar-probar-modelo">
        <span className="navbar-title">Prueba de Modelo</span>
        <button
          style={{
            marginLeft: 'auto',
            background: 'transparent',
            color: '#fff',
            border: 'none',
            fontSize: '1.1rem',
            cursor: 'pointer',
            fontWeight: 500
          }}
          onClick={() => navigate('/login')}
        >
          Volver al inicio
        </button>
      </nav>
      <div className="probar-modelo-content">
        {/* --------- SECCIÓN VIDEO --------- */}
        <div className="video-upload-section video-upload-section-large">
          <h2>Selecciona tu Video</h2>
          <input type="file" accept="video/*" onChange={handleVideoUpload} />
          
          {/* Stream MJPEG mientras se procesa */}
          {streamURL && (
            <img
              src={streamURL}
              alt="Stream procesado"
              className="video-preview"
            />
          )}

          {/* Animación de procesamiento y progreso */}
          {processing && (
            <div style={{ marginTop: 20, color: "#2b4b7d", fontWeight: "bold", textAlign: "center" }}>
              <div style={{ marginBottom: 10 }}>Procesando video... {progress}%</div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fg" style={{ width: `${progress}%` }} />
              </div>
              <div style={{ marginTop: 10 }}>
                <span className="spinner" />
              </div>
            </div>
          )}

          {/* Mensaje de éxito y botones */}
          {showSuccess && (
            <div style={{ marginTop: 24, textAlign: "center" }}>
              <div style={{ color: "#2b4b7d", fontWeight: "bold", marginBottom: 10 }}>
                ¡El video se procesó correctamente!
              </div>
              <button
                style={{
                  background: "#2b4b7d",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "10px 18px",
                  fontWeight: "bold",
                  marginRight: 12,
                  cursor: "pointer"
                }}
                onClick={() => {
                  setStreamURL(null);
                  setProcessing(false);
                }}
              >
                Ver video procesado
              </button>
              {videoURL && (
                <a
                  href={videoURL}
                  download
                  style={{
                    background: "#4CAF50",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "10px 18px",
                    fontWeight: "bold",
                    textDecoration: "none"
                  }}
                >
                  Descargar video
                </a>
              )}
            </div>
          )}

          {/* Video procesado cuando esté listo */}
          {videoURL && !streamURL && !processing && (
            <video src={videoURL} controls className="video-preview" />
          )}
        </div>

        {/* --------- SECCIÓN CONTEO --------- */}
        <div className="conteo-section conteo-section-large">
          <h2>Conteo de Personas</h2>
          <div className="conteo-numero">
            <span className="conteo-cifra">{peopleCount}</span>
            <span className="conteo-label">personas detectadas</span>
          </div>

          <label className="aforo-label">
            Aforo máximo:
            <input
              type="number"
              value={maxCapacity}
              onChange={handleMaxCapacityChange}
              min="1"
              max="100"
              className="aforo-input"
            />
          </label>

          {peopleCount > maxCapacity && <p className="warning">¡Sobreaforo!</p>}
        </div>
      </div>

      {/* Estilos para barra de progreso y spinner */}
      <style>{`
        .progress-bar-bg {
          width: 100%;
          height: 16px;
          background: #e0e6f6;
          border-radius: 8px;
          margin: 0 auto;
          overflow: hidden;
          margin-bottom: 8px;
        }
        .progress-bar-fg {
          height: 100%;
          background: #2b4b7d;
          border-radius: 8px 0 0 8px;
          transition: width 0.3s;
        }
        .spinner {
          display: inline-block;
          width: 28px;
          height: 28px;
          border: 4px solid #2b4b7d;
          border-top: 4px solid #e0e6f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProbarModelo;
