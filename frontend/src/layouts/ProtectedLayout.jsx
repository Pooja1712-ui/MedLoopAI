import React from "react";
// Fixed the import path to be more explicit for the bundler
import { useAuth } from "../context/AuthContext.jsx";
import { Navigate, Outlet } from "react-router-dom";

// This component checks if a user is logged in.
// If not, it redirects them to the /login page.
const ProtectedLayout = () => {
  const { user, token } = useAuth();

  // You can check for just token, or both user and token
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If they are logged in, render the child route (e.g., Dashboard)
  return <Outlet />;
};

export default ProtectedLayout;
