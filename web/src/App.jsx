import React, { useState } from "react";

import Splash from "./Splash";
import LoginScreen from "./Login";
import AdminLogin from "./AdminLogin";
import Dashboard from "./Dashboard";
import AdminDashboard from "./AdminDashboard";
import ReportsDashboard from "./ReportsDashboard";
import ProbarModelo from "./ProbarModelo";


export default function App() {
  const [screen, setScreen] = useState("splash");
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Navegación simple por estado
  const goTo = (nextScreen) => setScreen(nextScreen);

  // Handlers
  const handleSplashDone = () => goTo("login");
  const handleLoginSelect = (sel) => {
    if (sel === "admin") {
      goTo("adminLogin");
    } else {
      setRole("user");
      setIsAuthenticated(true);
      goTo("dashboard");
    }
  };
  const handleAdminSubmit = () => {
    setRole("admin");
    setIsAuthenticated(true);
    goTo("dashboard");
  };
  const handleLogout = () => {
    setRole(null);
    setIsAuthenticated(false);
    goTo("login");
  };
  const handleProbarModelo = () => {
    setRole("user");
    setIsAuthenticated(true);
    goTo("probarModelo");
  };

  // Renderizado condicional
  switch (screen) {
    case "splash":
      return <Splash onDone={handleSplashDone} />;
    case "login":
      return <LoginScreen onSelect={handleLoginSelect} onProbarModelo={handleProbarModelo} />;
    case "adminLogin":
      return <AdminLogin onBack={handleLogout} onLogin={handleAdminSubmit} />;
    case "dashboard":
      return isAuthenticated ? <Dashboard onBack={handleLogout} /> : <LoginScreen onSelect={handleLoginSelect} onProbarModelo={handleProbarModelo} />;
    case "adminDashboard":
      return isAuthenticated && role === "admin" ? <AdminDashboard onHome={handleLogout} onReports={() => goTo("reports")} /> : <LoginScreen onSelect={handleLoginSelect} onProbarModelo={handleProbarModelo} />;
    case "reports":
      return isAuthenticated && role === "admin" ? <ReportsDashboard onBack={() => goTo("adminDashboard")} /> : <LoginScreen onSelect={handleLoginSelect} onProbarModelo={handleProbarModelo} />;
    case "probarModelo":
      return isAuthenticated ? <ProbarModelo /> : <LoginScreen onSelect={handleLoginSelect} onProbarModelo={handleProbarModelo} />;
    default:
      return <Splash onDone={handleSplashDone} />;
  }
}
