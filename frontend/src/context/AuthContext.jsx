import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Define the API base URL
const API_URL = import.meta.env.VITE_API_URL;

const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const navigate = useNavigate();

  // Effect to load user from token on app load
  useEffect(() => {
    if (token) {
      // You might want to add a 'validate-token' endpoint
      // For now, we'll just re-set the user from localStorage
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
          setUser(storedUser);
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
      } catch (e) {
        console.error("Could not parse user from localStorage", e);
        logout();
      }
    }
  }, [token]);

  // --- LOGIN FUNCTION ---
  const login = async (email, password, role = null) => {
    setIsAuthLoading(true);
    try {
      const payload = { email, password };
      const res = await axios.post(`${API_URL}/login`, payload);

      const { token, user: loggedInUser } = res.data;

      // Special check for Admin Login page
      if (role === "admin" && loggedInUser.role !== "admin") {
        throw new Error("You are not an authorized admin.");
      }

      // Store in state and localStorage
      setToken(token);
      setUser(loggedInUser);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Handle redirects
      handleRedirect(loggedInUser.role);
      return { success: true };
    } catch (err) {
      console.error("Login failed:", err);
      const message = err.response?.data?.msg || err.message || "Login failed.";
      return { success: false, error: message };
    } finally {
      setIsAuthLoading(false);
    }
  };

  // --- REGISTER FUNCTION ---
  const register = async (formData) => {
    setIsAuthLoading(true);
    try {
      const res = await axios.post(`${API_URL}/register`, formData);

      const { token, user: registeredUser } = res.data;

      // Store in state and localStorage
      setToken(token);
      setUser(registeredUser);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(registeredUser));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Handle redirects
      handleRedirect(registeredUser.role);
      return { success: true };
    } catch (err) {
      console.error("Registration failed:", err);
      const message =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.msg ||
        "Registration failed.";
      return { success: false, error: message };
    } finally {
      setIsAuthLoading(false);
    }
  };

  // --- LOGOUT FUNCTION ---
  const logout = () => {
    // Clear state and localStorage
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    navigate("/login");
  };

  // --- REDIRECT HELPER ---
  const handleRedirect = (role) => {
    switch (role) {
      case "admin":
        navigate("/admin-dashboard");
        break;
      case "donor":
        navigate("/donor-dashboard");
        break;
      case "receiver":
        navigate("/");
        break;
      default:
        navigate("/");
    }
  };

  const value = {
    user,
    token,
    isAuthLoading,
    login,
    register,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
