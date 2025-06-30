import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";
import VideoStream from "./VideoStream";

export default function AdminDashboard({ onHome, onReports }) {
  const [time, setTime] = useState(new Date());
  const [passengerCount, setPassengerCount] = useState(0);
  const capacity = 30;

  const handleReports = () => {
    if (onReports) onReports();
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const status =
    passengerCount > capacity
      ? "Sobreaforo"
      : passengerCount === capacity
        ? "Lleno"
        : "OK";

  return (
    <div className="admin-parent">
      {/* Navbar con CPATBUS, Dashboard y Reportes */}
      <div className="div3">
        <div className="nav-bar">
          <button className="nav-left" onClick={onHome}>
            CPATBUS
          </button>
          <div className="nav-center">
            <button className="nav-btn">Dashboard</button>
            <button className="nav-btn" onClick={handleReports}>
              Reportes
            </button>
          </div>
          <div className="nav-right" />
        </div>
      </div>

      {/* Mapa de buses */}
      <div className="div4">
        <iframe
          src="https://zenbus.net/publicapp/limasanisidromibus77868410?line=677150016"
          title="Mapa de Buses"
        />
      </div>

      {/* Vídeo en vivo */}
      <div className="div5">
        <VideoStream />
      </div>

      {/* Reloj */}
      <div className="div7">
        <p className="clock">{time.toLocaleTimeString()}</p>
        <p className="date">{time.toLocaleDateString()}</p>
      </div>

      {/* Datos del bus */}
      <div className="div8">
        <h3>Datos del Bus</h3>
        <ul>
          <li><strong>Capacidad:</strong> {capacity}</li>
          <li><strong>Pasajeros:</strong> {passengerCount}</li>
          <li><strong>Estado:</strong> {status}</li>
        </ul>
      </div>
    </div>
  );
}
