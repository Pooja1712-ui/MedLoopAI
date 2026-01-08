import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

import {
  Loader2,
  AlertCircle,
  Package,
  Pill,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Inbox,
  Plus,
  HelpCircle, // For 'Requested'
  UserCheck, // For 'Collected'
  CheckCheck, // For 'Delivered'
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// --- Helper Components ---
const LoadingIndicator = () => (
  <div className="flex justify-center items-center py-20">
    <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
    <span className="ml-3 text-gray-700">Loading your donations...</span>
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

// UPDATED status visuals
const getStatusVisuals = (status) => {
  switch (status) {
    case "approved":
      return {
        icon: CheckCircle,
        color: "text-green-600",
        text: "Approved (Awaiting Request)",
      };
    case "requested":
      return { icon: HelpCircle, color: "text-orange-600", text: "Requested" };
    case "collected":
      return { icon: UserCheck, color: "text-blue-600", text: "Collected" };
    case "delivered":
      return { icon: CheckCheck, color: "text-purple-600", text: "Delivered" };
    case "rejected":
      return { icon: XCircle, color: "text-red-600", text: "Rejected" };
    case "pending_approval":
    default:
      return { icon: Clock, color: "text-yellow-600", text: "Pending Admin" };
  }
};
// --- End Helper Components ---

// Read API URL from environment variable
const API_BASE_URL ="http://localhost:5001/api";
const DONATION_API_URL = API_BASE_URL
  ? `${API_BASE_URL}/donations`
  : "/api/donations";

const MyDonations = () => {
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null); // Track which donation is being updated
  const { token } = useAuth();

  // Fetch all donations for the logged-in donor
  const fetchMyDonations = useCallback(async () => {
    if (!token) {
      setError("You must be logged in to view your donations.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(DONATION_API_URL, config);
      if (Array.isArray(res.data)) {
        setDonations(res.data);
      } else {
        console.error("API did not return an array for donations:", res.data);
        setError("Received an unexpected data format from the server.");
        setDonations([]);
      }
    } catch (err) {
      console.error("Failed to fetch donations:", err);
      setError(err.response?.data?.msg || "Failed to load donations.");
      setDonations([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMyDonations();
  }, [fetchMyDonations]);

  // UPDATED Handler: Can send 'collected' or 'delivered'
  const handleStatusUpdate = async (donationId, newStatus) => {
    if (updatingId) return; // Prevent multiple clicks
    setUpdatingId(donationId);
    setError("");

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = { status: newStatus }; // 'collected' or 'delivered'
      const res = await axios.put(
        `${DONATION_API_URL}/${donationId}/donor-status`,
        payload,
        config
      );

      // Update local state with the returned donation
      setDonations((prevDonations) =>
        prevDonations.map((d) => (d._id === donationId ? res.data : d))
      );
    } catch (err) {
      console.error(`Failed to mark as ${newStatus}:`, err);
      setError(err.response?.data?.msg || "Failed to update status.");
    } finally {
      setUpdatingId(null); // Clear loading state
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 md:py-16">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          My Donation History
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Track and manage your generous contributions here.
        </p>
      </div>

      {isLoading && <LoadingIndicator />}
      {error && <ErrorMessage message={error} />}

      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          {donations.length === 0 ? (
            <div className="text-center p-12 text-gray-500">
              <Inbox className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium">No donations found.</h3>
              <p className="mt-1 text-sm">
                When you add a donation, it will appear here.
              </p>
              <Link
                to="/add-donation"
                className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Make a Donation
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Item
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Requested By (Receiver)
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {donations.map((donation) => {
                    const status = getStatusVisuals(donation.status);
                    const isDevice = donation.itemType === "device";
                    const itemName = isDevice
                      ? donation.deviceType || "Device"
                      : donation.medicineName || "Medicine";
                    const receiverName = donation.receiver
                      ? donation.receiver.organizationName ||
                        donation.receiver.email
                      : "N/A";
                    const isLoadingThis = updatingId === donation._id;

                    return (
                      <tr
                        key={donation._id}
                        className={`hover:bg-gray-50 ${
                          isLoadingThis ? "opacity-50" : ""
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-10 w-10 rounded-md object-cover flex-shrink-0"
                              src={donation.imageUrl}
                              alt={itemName}
                            />
                            <div className="ml-4">
                              <div
                                className="text-sm font-medium text-gray-900 capitalize truncate max-w-xs"
                                title={itemName}
                              >
                                {itemName}
                              </div>
                              <div className="text-sm text-gray-500 capitalize">
                                {isDevice
                                  ? donation.condition
                                  : donation.quantity}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(donation.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${status.color}`}
                          >
                            <status.icon className="w-3.5 h-3.5 mr-1" />
                            {status.text}
                          </span>
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          title={receiverName}
                        >
                          <span className="truncate max-w-[150px] block">
                            {receiverName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {/* --- UPDATED ACTION LOGIC --- */}
                          {donation.status === "requested" && (
                            <button
                              onClick={() =>
                                handleStatusUpdate(donation._id, "collected")
                              }
                              disabled={isLoadingThis}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                              {isLoadingThis ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <UserCheck className="w-4 h-4" />
                              )}
                              <span className="ml-1.5">
                                {isLoadingThis ? "..." : "Mark as Collected"}
                              </span>
                            </button>
                          )}

                          {donation.status === "collected" && (
                            <button
                              onClick={() =>
                                handleStatusUpdate(donation._id, "delivered")
                              }
                              disabled={isLoadingThis}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                            >
                              {isLoadingThis ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Truck className="w-4 h-4" />
                              )}
                              <span className="ml-1.5">
                                {isLoadingThis ? "..." : "Mark as Delivered"}
                              </span>
                            </button>
                          )}

                          {(donation.status === "approved" ||
                            donation.status === "pending_approval") && (
                            <span className="text-xs text-gray-500 italic">
                              Awaiting request...
                            </span>
                          )}

                          {donation.status === "delivered" && (
                            <span className="text-xs text-purple-600 font-medium inline-flex items-center">
                              <CheckCheck className="w-4 h-4 mr-1" />
                              Completed
                            </span>
                          )}

                          {donation.status === "rejected" && (
                            <span className="text-xs text-red-600 font-medium">
                              Rejected
                            </span>
                          )}
                          {/* --- END ACTION LOGIC --- */}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyDonations;
