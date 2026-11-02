
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";

// RUTAS DE LA APLICACIÓN
function AppRoutes() {

  const { isAuthenticated, loginWithGoogle, logout } = useAuth();

  const navigate = useNavigate();

  // INICIAR SESIÓN
  const handleLogin = () => {
    loginWithGoogle();
    navigate("/dashboard", { replace: true });
  };

  // CERRAR SESIÓN
  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <Routes>

      {/* LANDING PAGE */}
      <Route
        path="/"
        element={
          isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <LandingPage onGoogleLogin={handleLogin} />
        }
      />

      {/* DASHBOARD PROTEGIDO */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      {/* RUTAS NO EXISTENTES */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}

// COMPONENTE PRINCIPAL
export default function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}