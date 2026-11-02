
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("phishguard_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // AUTENTICACIÓN SIMULADA
  const loginWithGoogle = () => {

    const demoUser = {
      name: "Usuario de prueba",
      email: "usuario@gmail.com",
      picture: null,
      provider: "google"
    };

    localStorage.setItem(
      "phishguard_user",
      JSON.stringify(demoUser)
    );

    setUser(demoUser);
  };

  // CERRAR SESIÓN
  const logout = () => {
    localStorage.removeItem("phishguard_user");
    setUser(null);
  };

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loginWithGoogle,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// HOOK PERSONALIZADO
export function useAuth() {
  return useContext(AuthContext);
}
