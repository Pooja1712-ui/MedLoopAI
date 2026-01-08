import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx"; // Fixed import path
import { HeartHandshake, ArrowLeft } from "lucide-react";

// This animation is self-contained for this standalone page
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isAuthLoading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // Pass 'admin' role to the login function for the special check
    const result = await login(email, password, "admin");

    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="container mx-auto max-w-7xl px-4 py-16 sm:py-24"
    >
      <div className="relative max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <Link
          to="/"
          className="absolute top-4 left-4 p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors duration-200"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="flex justify-center mb-6">
          <HeartHandshake className="w-12 h-12 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-4">
          Admin Login
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Please enter your administrator credentials.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-3 text-center text-sm text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="••••••••"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isAuthLoading}
            className="w-full px-6 py-3 font-medium text-white transition-colors duration-200 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            {isAuthLoading ? "Logging in..." : "Log In"}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default AdminLoginPage;
