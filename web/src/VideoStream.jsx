// web/src/VideoStream.jsx
import React, { useEffect, useRef } from "react";

export default function VideoStream() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // 1) Abre WebSocket con tu backend
    const ws = new WebSocket("ws://localhost:8000/ws/stream");

    ws.onmessage = (event) => {
      // 2) Crea una imagen en base al Base64 recibido
      const img = new Image();
      img.src = "data:image/jpeg;base64," + event.data;

      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        // 3) Ajusta tamaño del canvas si quieres mantener la resolución
        canvas.width = img.width;
        canvas.height = img.height;
        // 4) Dibuja el frame
        ctx.drawImage(img, 0, 0);
      };
    };

    ws.onclose = () => console.log("WebSocket cerrado");
    // 5) Limpieza al desmontar el componente
    return () => ws.close();
  }, []);

  // 6) Renderiza el canvas
  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "auto", background: "#000" }}
    />
  );
}
