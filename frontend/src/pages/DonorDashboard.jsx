import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx"; // Adjust path if needed
import { Link } from "react-router-dom";
import {
  Loader2,
  AlertCircle,
  Package,
  Clock,
  CheckCircle,
  PlusCircle,
  List,
  User,
  Inbox,
  Truck,
} from "lucide-react";
import { motion } from "framer-motion";

// --- Helper Components ---
// (We define these locally for a clean, self-contained dashboard page)

const LoadingIndicator = () => (
  <div className="flex justify-center items-center py-20">
    <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
    <span className="ml-3 text-gray-700">Loading dashboard data...</span>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div
    className="flex items-center p-4 my-6 text-sm text-red-700 bg-red-100 rounded-lg max-w-2xl mx-auto"
    role="alert"
  >
    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
    <span className="font-medium">{message || "An error occurred."}</span>
  </div>
);

// A card for displaying a single statistic
const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-start space-x-4"
  >
    <div
      className={`flex-shrink-0 p-3 rounded-full ${colorClass.bg} ${colorClass.text}`}
    >
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
        {title}
      </p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  </motion.div>
);

// A card for linking to another page
const ActionCard = ({ title, description, href, icon: Icon }) => (
  <motion.div
    whileHover={{
      y: -5,
      boxShadow:
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    }}
    className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-full flex flex-col"
  >
    <Link to={href} className="flex flex-col h-full">
      <div className="flex-shrink-0 p-3 rounded-full bg-indigo-100 text-indigo-600 w-12 h-12 flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
      <div className="mt-4 flex-grow">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </div>
      <p className="mt-4 text-sm font-medium text-indigo-600">Go now &rarr;</p>
    </Link>
  </motion.div>
);
// --- End Helper Components ---

// Read API URL from environment variable (Vite)
const API_BASE_URL =
  "http://localhost:5001/api";
const DONATION_API_URL = API_BASE_URL
  ? `${API_BASE_URL}/donations`
  : "/api/donations";

const DonorDashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0, // 'approved' or 'requested'
    completed: 0, // 'collected' or 'delivered'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all donations for this donor to calculate stats
  const fetchDonationStats = useCallback(async () => {
    if (!token) {
      setError("Authentication token not found.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // GET /api/donations - backend filters for the logged-in donor
      const res = await axios.get(DONATION_API_URL, config);

      if (Array.isArray(res.data)) {
        // Calculate stats from the fetched donations
        const allDonations = res.data;
        const total = allDonations.length;
        const pending = allDonations.filter(
          (d) => d.status === "pending_approval"
        ).length;
        const active = allDonations.filter(
          (d) => d.status === "approved" || d.status === "requested"
        ).length;
        const completed = allDonations.filter(
          (d) => d.status === "collected" || d.status === "delivered"
        ).length;

        setStats({ total, pending, active, completed });
      } else {
        console.error("API did not return an array for donations:", res.data);
        setError("Received an unexpected data format from the server.");
      }
    } catch (err) {
      console.error("Failed to fetch donation stats:", err);
      setError(err.response?.data?.msg || "Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDonationStats();
  }, [fetchDonationStats]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Welcome, {user?.name || user?.email || "Donor"}!
          </h1>
          <p className="text-lg text-gray-600">
            Here's a summary of your donation activity.
          </p>
        </motion.div>

        {/* Main Content */}
        {isLoading ? (
          <LoadingIndicator />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Donations"
                value={stats.total}
                icon={Inbox}
                colorClass={{ bg: "bg-indigo-100", text: "text-indigo-600" }}
              />
              <StatCard
                title="Pending Approval"
                value={stats.pending}
                icon={Clock}
                colorClass={{ bg: "bg-yellow-100", text: "text-yellow-600" }}
              />
              <StatCard
                title="Active Donations"
                value={stats.active}
                icon={CheckCircle}
                colorClass={{ bg: "bg-green-100", text: "text-green-600" }}
              />
              <StatCard
                title="Completed"
                value={stats.completed}
                icon={Truck}
                colorClass={{ bg: "bg-blue-100", text: "text-blue-600" }}
              />
            </div>

            {/* Quick Links Grid */}
            <div className="mt-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ActionCard
                  title="Make a New Donation"
                  description="Start the process of donating a medical device or medicine."
                  href="/add-donation"
                  icon={PlusCircle}
                />
                <ActionCard
                  title="View My Donations"
                  description="Track the status of all your submitted donations and manage requests."
                  href="/my-donations"
                  icon={List}
                />
                <ActionCard
                  title="Update My Profile"
                  description="Keep your contact information and address up to date."
                  href="/profile"
                  icon={User}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;
