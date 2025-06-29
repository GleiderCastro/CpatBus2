import React, { useEffect, useState } from "react";
import "./Splash.css";

import { ReactComponent as BusIcon }    from "./assets/bus.svg";
import { ReactComponent as CameraIcon } from "./assets/camara.svg";
import { ReactComponent as PersonIcon } from "./assets/persona_detectada.svg";

export default function Splash({ onDone }) {
  // Secuencia de íconos SVG
  const icons = [BusIcon, CameraIcon, PersonIcon, BusIcon];
  const [step, setStep]       = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  // Timers para cambiar iconos, hacer fade-out y terminar el splash
  useEffect(() => {
    const ICON_INTERVAL = 800;                      // 0.8 s por icono
    const TOTAL         = ICON_INTERVAL * icons.length; // 4 iconos → 3200 ms
    const FADE_DUR      = 500;                      // 0.5 s de fade-out

    const iv = setInterval(() => setStep(s => s + 1), ICON_INTERVAL);
    const fadeTimer = setTimeout(() => setFadeOut(true), TOTAL - FADE_DUR);
    const finish    = setTimeout(() => {
      clearInterval(iv);
      clearTimeout(fadeTimer);
      if (onDone) onDone();
    }, TOTAL);

    return () => {
      clearInterval(iv);
      clearTimeout(fadeTimer);
      clearTimeout(finish);
    };
  }, [onDone, icons.length]);

  // Icono actual según el step
  const CurrentIcon = icons[Math.min(step, icons.length - 1)];

  return (
    <div className={`splash-container ${fadeOut ? "fade-out" : ""}`}>
      <div className="splash-box">
        {/* Icono centrado */}
        <div className="icon-sequence">
          <CurrentIcon className="icon-svg" />
        </div>

        {/* Barra de progreso desde el centro */}
        <div className="progress-container">
          <div className="progress-bar" />
        </div>

        {/* Texto animado */}
        <h1 className="splash-text">
          Bienvenidos a Cpatbus en Tiempo Real
        </h1>
      </div>
    </div>
  );
}
