import { createContext, useState, useEffect, useContext } from "react";

import api from "../services/api";

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // loading: Indicates whether the initial authentication check is complete.
  const [loading, setLoading] = useState(true);

  // Check whether a valid session already exists
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await api.get("/auth/me");
        setUser(response.data.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  // Login
  async function login(email, password) {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    setUser(response.data.data);
    return response.data.data;
  }

  // Register
  async function register(name, email, password) {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
    });

    return response.data.data;
  }

  // Logout
  async function logout() {
    await api.post("/auth/logout");
    setUser(null);
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// SELF-NOTE --> see pg-47 of document
function useAuth() {
  return useContext(AuthContext);
}

export { AuthProvider, useAuth };
