import React from "react";
import "./AdminDashboard.css"; // reutiliza el mismo grid

export default function ReportsDashboard({ onBack }) {
  return (
    <div className="admin-parent">
      {/* Navbar: CPATBUS y Reportes activo */}
      <div className="div3">
        <div className="nav-bar">
          <button className="nav-left" onClick={onBack}>
            ← Volver
          </button>
          <div className="nav-center">
            <button className="nav-btn" onClick={onBack}>
              Dashboard
            </button>
            <button className="nav-btn active">
              Reportes
            </button>
          </div>
          <div className="nav-right">
            CPATBUS
          </div>
        </div>
      </div>

      {/* Aquí puedes colocar tus componentes de reportes */}
      <div className="div4">
        <h3>Reportes</h3>
        <p>Aquí irán gráficos y tablas de análisis histórico.</p>
      </div>
    </div>
  );
}
