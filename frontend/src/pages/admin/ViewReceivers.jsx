import React, { useState, useEffect } from "react";
import axios from "axios";

import { Loader2, AlertCircle, Building } from "lucide-react"; // Added icons
import { useAuth } from "../../context/AuthContext";

// Read API URL from environment variable (adjust based on Vite or CRA)
const API_BASE_URL =
  import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL;
const USER_API_URL = API_BASE_URL
  ? API_BASE_URL.replace("/auth", "/users")
  : "/api/users";

// Simple Loading Component
const LoadingIndicator = () => (
  <div className="flex justify-center items-center py-10">
    <Loader2 className="h-6 w-6 text-indigo-600 animate-spin mr-3" />
    <span>Loading receivers...</span>
  </div>
);

// Simple Error Component
const ErrorMessage = ({ message }) => (
  <div
    className="flex items-center p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
    role="alert"
  >
    <AlertCircle className="w-5 h-5 mr-2 flex-wrap" />
    <span className="font-medium">{message || "An error occurred."}</span>
  </div>
);

const ViewReceivers = () => {
  const [receivers, setReceivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAuth(); // Get token for authenticated request

  useEffect(() => {
    const fetchReceivers = async () => {
      setIsLoading(true);
      setError("");
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`, // Include token for admin check
          },
        };
        const res = await axios.get(`${USER_API_URL}/receivers`, config);
        setReceivers(res.data);
      } catch (err) {
        console.error("Failed to fetch receivers:", err);
        setError(
          err.response?.data?.msg ||
            "Failed to load receiver data. Ensure you are logged in as an admin."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchReceivers();
    } else {
      setError("Authentication token not found.");
      setIsLoading(false);
    }
  }, [token]); // Re-fetch if token changes

  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Manage Receivers ({receivers.length})
      </h2>

      {isLoading && <LoadingIndicator />}
      {error && <ErrorMessage message={error} />}

      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Organization Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Location
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Contact
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Registered On
                  </th>
                  {/* Add more columns like Status (Approved/Pending), Registration No., etc. */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {receivers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                    >
                      No receivers found.
                    </td>
                  </tr>
                ) : (
                  receivers.map((receiver) => (
                    <tr key={receiver._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                        <Building className="w-5 h-5 text-gray-400 mr-2 flex-wrap" />
                        <span className="truncate">
                          {receiver.organizationName || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate">
                        {receiver.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {receiver.address?.city || "N/A"}
                        {receiver.address?.state
                          ? `, ${receiver.address.state}`
                          : ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {receiver.contactPerson?.name || "N/A"}{" "}
                        {receiver.contactPerson?.phone
                          ? `(${receiver.contactPerson.phone})`
                          : ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(receiver.createdAt).toLocaleDateString()}
                      </td>
                      {/* Add action buttons (View Details, Approve, Edit, Delete) if needed */}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewReceivers;
