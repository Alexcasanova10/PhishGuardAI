
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {

  const { isAuthenticated, isLoading } = useAuth();

  // ESPERAR A VERIFICAR LA SESION
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

          <p className="text-sm text-zinc-400">
            Verificando sesión...
          </p>
        </div>
      </div>
    );
  }

  // SI NO ESTA AUTENTICADO, REGRESAR AL INICIO
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
