import React from "react";
import { useAuth } from "../context/AuthContext.jsx"; // Fixed import path

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-16">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
        Admin Dashboard
      </h1>
      <p className="text-xl text-gray-600">
        Welcome, {user?.email}! You have administrative access.
      </p>
      {/* TODO: Add admin controls (e.g., user list, approve NGOs) here */}
    </div>
  );
};

export default AdminDashboard;
