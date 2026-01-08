import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
// import AuthToggle from "../components/AuthToggle"; // Removed broken import
// import { fadeIn } from "../utils/animations"; // Removed broken import
import { ArrowLeft, HeartHandshake } from "lucide-react";
import { useAuth } from "../context/AuthContext";


// --- START: Added missing components/utils ---

// Animation Variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// AuthToggle Component
const AuthToggle = ({ userType, setUserType }) => {
  const baseStyle =
    "w-1/2 py-3 px-4 rounded-full font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1";
  const activeStyle = "bg-indigo-600 text-white shadow-md";
  const inactiveStyle = "bg-gray-100 text-gray-700 hover:bg-gray-200";

  return (
    <div className="w-full max-w-sm p-1.5 flex bg-gray-100 rounded-full border border-gray-200">
      <button
        onClick={() => setUserType("donor")}
        className={`${baseStyle} ${
          userType === "donor" ? activeStyle : inactiveStyle
        }`}
      >
        I am a Donor
      </button>
      <button
        onClick={() => setUserType("receiver")}
        className={`${baseStyle} ${
          userType === "receiver" ? activeStyle : inactiveStyle
        }`}
      >
        I am a Receiver
      </button>
    </div>
  );
};
// --- END: Added missing components/utils ---

const RegisterPage = () => {
  const [userType, setUserType] = useState("donor");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    organizationName: "",
  });
  const [error, setError] = useState("");
  const { register, isAuthLoading } = useAuth(); // Use auth context

  const { email, password, fullName, organizationName } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Prepare data for API
    const apiData = {
      email,
      password,
      role: userType,
    };

    if (userType === "donor") {
      apiData.fullName = fullName;
    } else {
      apiData.organizationName = organizationName;
    }

    // Call register function from context
    const result = await register(apiData);

    if (!result.success) {
      setError(result.error);
    }
    // Redirects are handled by the context
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
          Create Your Account
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Join us as a {userType === "donor" ? "Donor" : "Receiver"}.
        </p>

        <div className="flex justify-center mb-8">
          <AuthToggle userType={userType} setUserType={setUserType} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-3 text-center text-sm text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          {/* Conditional Fields based on User Type */}
          {userType === "receiver" ? (
            <div>
              <label
                htmlFor="organizationName"
                className="block text-sm font-medium text-gray-700"
              >
                NGO / Hospital / Receiver Name
              </label>
              <input
                type="text"
                id="organizationName"
                name="organizationName"
                value={organizationName}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. Community Health Clinic"
              />
            </div>
          ) : (
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={fullName}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. Jane Doe"
              />
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
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="you@example.com"
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
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Create a strong password (min. 6 chars)"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isAuthLoading} // Disable button while loading
            className="w-full px-6 py-3 font-medium text-white transition-colors duration-200 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            {isAuthLoading ? "Creating Account..." : "Create Account"}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            Log in
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default RegisterPage;
