
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate
} from "react-router-dom";

import {
  AuthProvider,
  useAuth
} from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";


function AppRoutes() {

  const {
    isAuthenticated,
    isLoading,
    loginWithGoogle,
    logout
  } = useAuth();

  const navigate = useNavigate();

  // INICIO DE SESION
  const handleLogin = async (googleToken) => {

    try {

      await loginWithGoogle(googleToken);

      navigate("/dashboard", {
        replace: true
      });

    } catch (error) {

      console.error("Error de login:", error);

      throw error;
    }
  };

  // CERRAR SESION
  const handleLogout = async () => {

    try {

      await logout();

      navigate("/", {
        replace: true
      });

    } catch (error) {

      console.error("Error cerrando sesión:", error);

      alert("No se pudo cerrar la sesión. Intenta nuevamente.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400 text-sm">
          Cargando PhishGuard AI...
        </p>
      </div>
    );
  }

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

      {/* RUTAS DESCONOCIDAS */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}


export default function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
