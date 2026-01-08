import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Loader2, AlertCircle, UserCircle, MapPin } from "lucide-react"; // Added icons

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
    <span>Loading donors...</span>
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

const ViewDonors = () => {
  const [donors, setDonors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAuth(); // Get token for authenticated request

  useEffect(() => {
    const fetchDonors = async () => {
      setIsLoading(true);
      setError("");
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`, // Include token for admin check
          },
        };
        const res = await axios.get(`${USER_API_URL}/donors`, config);
        console.log("donar data", res.data);
        setDonors(res.data);
      } catch (err) {
        console.error("Failed to fetch donors:", err);
        setError(
          err.response?.data?.msg ||
            "Failed to load donor data. Ensure you are logged in as an admin."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchDonors();
    } else {
      setError("Authentication token not found.");
      setIsLoading(false);
    }
  }, [token]); // Re-fetch if token changes
  // Helper function to format address
  const formatAddress = (address) => {
    if (!address || (!address.city && !address.state && !address.pincode)) {
      return "N/A";
    }
    // Join city, state, and pincode if they exist
    return [address.city, address.state, address.pincode]
      .filter(Boolean)
      .join(", ");
  };
  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Manage Donors ({donors.length})
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
                    Name
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
                    Mobile
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Address (City, State, Pincode)
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Registered On
                  </th>
                  {/* Add more columns as needed */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donors.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                    >
                      No donors found.
                    </td>
                  </tr>
                ) : (
                  donors.map((donor) => (
                    <tr key={donor._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                        <UserCircle className="w-6 h-6 text-gray-400 mr-2" />
                        {donor.fullName || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {donor.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {donor.mobileNumber || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-1.5 flex-shrink-0" />
                          <span
                            className="truncate"
                            title={formatAddress(donor.address)}
                          >
                            {formatAddress(donor.address)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(donor.createdAt).toLocaleDateString()}{" "}
                        {/* Format date */}
                      </td>
                      {/* Add action buttons (View Details, Edit, Delete) if needed */}
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

export default ViewDonors;
