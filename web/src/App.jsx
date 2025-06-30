import React, { useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";

import Splash from "./Splash";
import LoginScreen from "./Login";
import AdminLogin from "./AdminLogin";
import Dashboard from "./Dashboard";
import AdminDashboard from "./AdminDashboard";
import ReportsDashboard from "./ReportsDashboard";
import ProbarModelo from "./ProbarModelo";

export default function App() {
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const handleSplashDone = () => navigate("/login");

  const handleLoginSelect = (sel) => {
    if (sel === "admin") {
      navigate("/admin-login");
    } else {
      setRole("user");
      setIsAuthenticated(true);
      navigate("/dashboard");
    }
  };

  const handleAdminSubmit = () => {
    setRole("admin");
    setIsAuthenticated(true);
    navigate("/dashboard");
  };

  const handleLogout = () => {
    setRole(null);
    setIsAuthenticated(false);
    navigate("/login");
  };

  const handleProbarModelo = () => {
    setRole("user");
    setIsAuthenticated(true);
    navigate("/probar-modelo");
  };

  return (
    <Routes>
      <Route path="/" element={<Splash onDone={handleSplashDone} />} />
      <Route
        path="/login"
        element={<LoginScreen onSelect={handleLoginSelect} onProbarModelo={handleProbarModelo} />}
      />
      <Route
        path="/admin-login"
        element={<AdminLogin onBack={() => navigate("/login")} onLogin={handleAdminSubmit} />}
      />
      <Route
        path="/dashboard"
        element={isAuthenticated ? <Dashboard onBack={handleLogout} /> : <Navigate to="/login" />}
      />
      <Route
        path="/admin-dashboard"
        element={isAuthenticated && role === "admin" ? (
          <AdminDashboard onHome={handleLogout} onReports={() => navigate("/reports")} />
        ) : (
          <Navigate to="/login" />
        )}
      />
      <Route
        path="/reports"
        element={isAuthenticated && role === "admin" ? (
          <ReportsDashboard onBack={() => navigate("/admin-dashboard")} />
        ) : (
          <Navigate to="/login" />
        )}
      />
      <Route
        path="/probar-modelo"
        element={isAuthenticated ? <ProbarModelo /> : <Navigate to="/login" />}
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
