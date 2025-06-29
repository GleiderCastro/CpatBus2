import React, { useEffect, useState } from "react";
import "./Login.css";

export default function LoginScreen({ onSelect, onProbarModelo }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`login-screen-container ${visible ? "fade-in" : "fade-out"}`}>
      <div className="login-screen-left">
        <div className="welcome-box">
          <h1>CPATBUS</h1>
          <p>BIENVENIDOS A NUESTRO SISTEMA DE AFORO EN TIEMPO REAL.</p>
        </div>
      </div>
      <div className="login-screen-right">
        <div className="role-box">
          <h3>SELECCIONE CÓMO DESEA INGRESAR</h3>
          <button onClick={() => onSelect && onSelect("user")}>USUARIO</button>
          <button onClick={() => onSelect && onSelect("admin")}>ADMINISTRADOR</button>
        </div>
        {/* Agregar el botón "PROBAR MODELO" directamente aquí */}
        <div className="test-button-container">
          <button className="super-button" onClick={onProbarModelo}>
            <span>PROBAR MODELO</span>
            <svg fill="none" viewBox="0 0 24 24" className="arrow">
              <path
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth={2}
                stroke="currentColor"
                d="M5 12h14M13 6l6 6-6 6"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
