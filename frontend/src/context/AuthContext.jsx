
// import { createContext, useContext, useState } from "react";

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {

//   const [user, setUser] = useState(() => {
//     const savedUser = localStorage.getItem("phishguard_user");
//     return savedUser ? JSON.parse(savedUser) : null;
//   });

//   // AUTENTICACIÓN SIMULADA
//   const loginWithGoogle = () => {

//     const demoUser = {
//       name: "Usuario de prueba",
//       email: "usuario@gmail.com",
//       picture: null,
//       provider: "google"
//     };

//     localStorage.setItem(
//       "phishguard_user",
//       JSON.stringify(demoUser)
//     );

//     setUser(demoUser);
//   };

//   // CERRAR SESIÓN
//   const logout = () => {
//     localStorage.removeItem("phishguard_user");
//     setUser(null);
//   };

//   const isAuthenticated = Boolean(user);

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         isAuthenticated,
//         loginWithGoogle,
//         logout
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// // HOOK PERSONALIZADO
// export function useAuth() {
//   return useContext(AuthContext);
// }


import {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL ||
  "http://localhost:8000";

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // VERIFICAR SI EXISTE UNA SESION
  useEffect(() => {

    let active = true;

    const checkSession = async () => {

      try {

        const response = await fetch(
          `${API_URL}/api/v1/auth/me`,
          {
            method: "GET",
            credentials: "include"
          }
        );

        if (!response.ok) {
          if (active) setUser(null);
          return;
        }

        const data = await response.json();

        if (active) {
          setUser(data.user);
        }

      } catch (error) {

        console.error("Error verificando sesion:", error);

        if (active) setUser(null);

      } finally {

        if (active) setIsLoading(false);

      }
    };

    checkSession();

    return () => {
      active = false;
    };

  }, []);

  // LOGIN CON GOOGLE
  const loginWithGoogle = async (googleToken) => {

    const response = await fetch(
      `${API_URL}/api/v1/auth/google`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id_token: googleToken
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "No se pudo iniciar sesion"
      );
    }

    setUser(data.user);

    return data.user;
  };

  // LOGOUT
  const logout = async () => {

    const response = await fetch(
      `${API_URL}/api/v1/auth/logout`,
      {
        method: "POST",
        credentials: "include"
      }
    );

    if (!response.ok) {
      throw new Error("No se pudo cerrar la sesion");
    }

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        loginWithGoogle,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
