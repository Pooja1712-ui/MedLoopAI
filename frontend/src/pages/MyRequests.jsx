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
  HelpCircle, // <-- Icon for 'requested'
  UserCheck, // <-- Icon for 'collected'
  Plus,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
// Assuming context is one level up
import { useAuth } from "../context/AuthContext.jsx";

// --- Helper Components ---

const LoadingIndicator = () => (
  <div className="flex justify-center items-center py-20">
    <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
    <span className="ml-3 text-gray-700">Loading your requests...</span>
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

// --- UPDATED getStatusVisuals function ---
// This now shows the correct text for a Receiver
const getStatusVisuals = (status) => {
  switch (status) {
    case "approved":
      // Receivers shouldn't see this state, as it becomes 'requested' when they claim it
      return {
        icon: CheckCircle,
        color: "text-gray-500",
        text: "Approved (Not Requested)",
      };
    case "requested":
      // This item has been requested by the receiver, waiting for donor
      return {
        icon: HelpCircle,
        color: "text-orange-600",
        text: "Pending Donor Action",
      };
    case "collected":
      // The donor has marked this item as collected/shipped
      return { icon: UserCheck, color: "text-blue-600", text: "In Transit" };
    case "rejected":
      // Admin rejected the donation
      return { icon: XCircle, color: "text-red-600", text: "Rejected" };
    case "delivered":
      // Donor has marked as delivered
      return { icon: Truck, color: "text-purple-600", text: "Delivered" };
    case "pending_approval": // Should not appear in this list
    default:
      return { icon: Clock, color: "text-gray-500", text: "Processing" };
  }
};
// --- End Helper Components ---

// Read API URL from environment variable (Vite)
const API_BASE_URL = "http://localhost:5001/api"; // Use .env variable
const DONATION_API_URL = API_BASE_URL
  ? `${API_BASE_URL}/donations`
  : "/api/donations";

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { token, user } = useAuth(); // Get token and user
  const navigate = useNavigate();

  // Redirect donors away from this page
  useEffect(() => {
    if (user && user.role === "donor") {
      navigate("/donor-dashboard"); // Or '/'
    }
  }, [user, navigate]);

  // Fetch *only* the donations requested by this receiver
  const fetchMyRequests = useCallback(async () => {
    if (!token || user?.role !== "receiver") {
      if (user) setError("Only receivers can view this page.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // GET /api/donations - backend automatically filters for 'receiver: user.id'
      const res = await axios.get(DONATION_API_URL, config);
      if (Array.isArray(res.data)) {
        setRequests(res.data);
      } else {
        console.error("API did not return an array for requests:", res.data);
        setError("Received an unexpected data format from the server.");
        setRequests([]);
      }
    } catch (err) {
      console.error("Failed to fetch requests:", err);
      setError(err.response?.data?.msg || "Failed to load requests.");
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    fetchMyRequests();
  }, [fetchMyRequests]);

  // Handle non-receiver rendering
  if (user?.role !== "receiver") {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
        {isLoading ? (
          <LoadingIndicator />
        ) : (
          <ErrorMessage message={error || "Access denied."} />
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 md:py-16">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          My Requested Donations
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Track the status of items you have requested.
        </p>
      </div>

      {isLoading && <LoadingIndicator />}
      {error && <ErrorMessage message={error} />}

      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          {requests.length === 0 ? (
            <div className="text-center p-12 text-gray-500">
              <Inbox className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium">No requests found.</h3>
              <p className="mt-1 text-sm">
                When you request a donation, it will appear here.
              </p>
              <Link
                to="/find-donations"
                className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Find Donations
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
                      Date Requested
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
                      Donor
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Donor Location
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((donation) => {
                    // Use the UPDATED status function
                    const status = getStatusVisuals(donation.status);
                    const isDevice = donation.itemType === "device";
                    const itemName = isDevice
                      ? donation.deviceType || "Device"
                      : donation.medicineName || "Medicine";
                    const donorName = donation.donor
                      ? donation.donor.fullName || donation.donor.email
                      : "Unknown Donor";
                    const donorLocation =
                      [
                        donation.donor?.address?.city,
                        donation.donor?.address?.state,
                      ]
                        .filter(Boolean)
                        .join(", ") || "N/A";

                    return (
                      <tr key={donation._id} className="hover:bg-gray-50">
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
                          {/* Use updatedAt to show when the 'requested' status was set */}
                          {new Date(donation.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowGrap text-sm font-medium">
                          {/* This will now show the correct text for 'requested' and 'collected' */}
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${status.color}`}
                          >
                            <status.icon className="w-3.5 h-3.5 mr-1" />
                            {status.text}
                          </span>
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          title={donorName}
                        >
                          <span className="truncate max-w-[150px] block">
                            {donorName}
                          </span>
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          title={donorLocation}
                        >
                          <span className="truncate max-w-[150px] block">
                            {donorLocation}
                          </span>
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

export default MyRequests;
