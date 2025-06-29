// web/src/AdminLogin.jsx
import React, { useState } from "react";
import "./AdminLogin.css";

export default function AdminLogin({ onBack, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLogin) onLogin({ username, password });
  };

  return (
    <div className="admin-container">
      <div className="admin-box">
        <h2>Panel de Administrador</h2>
        <form className="admin-form" onSubmit={handleSubmit}>
          <label>Usuario</label>
          <input
            type="text"
            placeholder="Ingresa tu usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <label>Contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Iniciar Sesión</button>
        </form>
        <button className="back-btn" onClick={onBack}>
          ← Volver
        </button>
      </div>
    </div>
  );
}
