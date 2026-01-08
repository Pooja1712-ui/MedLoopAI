import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import { motion, AnimatePresence } from "framer-motion";
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
  Edit,
  Trash2,
  X as CloseIcon,
  ShieldCheck,
  AlertTriangle,
  PackageOpen,
} from "lucide-react";
import { useAuth } from '../../context/AuthContext';

// --- Helper Components ---
const LoadingIndicator = ({ text = "Loading donations..." }) => (
    <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        <span className="ml-3 text-gray-700">{text}</span>
    </div>
);

const ErrorMessage = ({ message }) => (
     <div className="flex items-center p-4 my-6 text-sm text-red-700 bg-red-100 rounded-lg max-w-2xl mx-auto" role="alert">
        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
        <span className="font-medium">{message || "An error occurred."}</span>
    </div>
);

const getStatusVisuals = (status) => {
    switch (status) {
        case 'approved':
            return { icon: CheckCircle, color: 'bg-green-100 text-green-800', text: 'Approved' };
        case 'rejected':
            return { icon: XCircle, color: 'bg-red-100 text-red-800', text: 'Rejected' };
        case 'collected':
           return {
             icon: PackageOpen,
             color: "bg-blue-100 text-blue-800",
             text: "Collected",
           };
        case 'delivered':
            return { icon: Truck, color: 'bg-green-100 text-green-800', text: 'Delivered' };
        case 'pending_approval':
        case 'pending_validation':
        default:
            return { icon: Clock, color: 'bg-yellow-100 text-yellow-800', text: 'Pending' };
    }
};

// --- Modal Animation Variants ---
const modalBackdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};
const modalContentVariants = {
     hidden: { opacity: 0, y: 30, scale: 0.95 },
     visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
     exit: { opacity: 0, y: 30, scale: 0.95, transition: { duration: 0.2 } }
};
// --- End Helper Components ---


// Read API URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL;
const DONATION_API_URL = API_BASE_URL ? API_BASE_URL.replace("/auth", "/donations") : "/api/donations";

// --- Main ViewDonations Component ---
const ViewDonations = () => {
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAuth();

  // Modal States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null); // Holds donation ID for delete confirmation
  const [updateTarget, setUpdateTarget] = useState(null); // Holds full donation object for status update
  const [newStatus, setNewStatus] = useState(""); // State for the status dropdown in the modal

  // Fetch all donations (admin protected route)
  const fetchAllDonations = useCallback(async () => {
    if (!token) {
      setError("Admin authentication token not found.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(DONATION_API_URL, config); // Admin gets all
      if (Array.isArray(res.data)) {
        setDonations(res.data);
      } else {
        console.error("API did not return an array:", res.data);
        setError("Received unexpected data format from server.");
      }
    } catch (err) {
      console.error("Failed to fetch donations:", err);
      setError(err.response?.data?.msg || "Failed to load donations.");
    } finally {
      setIsLoading(false);
    }
  }, [token]); // Dependency on token

  useEffect(() => {
    fetchAllDonations();
  }, [fetchAllDonations]);

  // --- Modal Handlers ---
  const openUpdateModal = (donation) => {
    setUpdateTarget(donation);
    setNewStatus(donation.status); // Pre-fill dropdown with current status
    setModalError("");
  };

  const openDeleteModal = (donationId) => {
    setDeleteTarget(donationId);
    setModalError("");
  };

  const closeModal = () => {
    setUpdateTarget(null);
    setDeleteTarget(null);
    setModalError("");
    setIsSubmitting(false);
  };

  // --- API Call Handlers ---
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!updateTarget || !newStatus || isSubmitting) return;

    setIsSubmitting(true);
    setModalError("");
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = { status: newStatus };
      // Call the PUT endpoint to update status
      const res = await axios.put(
        `${DONATION_API_URL}/${updateTarget._id}/status`,
        payload,
        config
      );

      // Update the status in the local state array
      setDonations((prevDonations) =>
        prevDonations.map((d) => (d._id === updateTarget._id ? res.data : d))
      );
      closeModal();
    } catch (err) {
      console.error("Failed to update status:", err);
      setModalError(err.response?.data?.msg || "Failed to update status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || isSubmitting) return;

    setIsSubmitting(true);
    setModalError("");
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // Call the DELETE endpoint
      await axios.delete(`${DONATION_API_URL}/${deleteTarget}`, config);

      // Remove the donation from the local state array
      setDonations((prevDonations) =>
        prevDonations.filter((d) => d._id !== deleteTarget)
      );
      closeModal();
    } catch (err) {
      console.error("Failed to delete donation:", err);
      setModalError(err.response?.data?.msg || "Failed to delete donation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to format address
  const formatAddress = (address) => {
    if (!address) return "N/A";
    const { city, state, pincode } = address;
    // Join city, state, and pincode if they exist
    return [city, state, pincode].filter(Boolean).join(", ") || "N/A";
  };
  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Manage Donations
      </h2>

      {isLoading && <LoadingIndicator />}
      {error && <ErrorMessage message={error} />}

      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          {donations.length === 0 ? (
            <div className="text-center p-12 text-gray-500">
              <Inbox className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium">No donations found.</h3>
              <p className="mt-1 text-sm">
                When users submit donations, they will appear here.
              </p>
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
                      Donor
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Donor Address
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
                    const donorAddress = formatAddress(donation.donor?.address);
                    return (
                      <tr
                        key={donation._id}
                        className="hover:bg-gray-50 transition duration-150 ease-in-out"
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
                          {donation.donor
                            ? donation.donor.fullName || donation.donor.email
                            : "Unknown Donor"}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          title={donorAddress}
                        >
                          <span className="truncate max-w-[200px] block">
                            {donorAddress}
                          </span>
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
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                          <button
                            onClick={() => openUpdateModal(donation)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Update Status"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(donation._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Donation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* --- Modals --- */}
      <AnimatePresence>
        {/* Update Status Modal */}
        {updateTarget && (
          <motion.div
            key="updateModalBackdrop"
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4"
            onClick={closeModal}
          >
            <motion.div
              key="updateModalContent"
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-xl shadow-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()} // Prevent closing on modal click
            >
              <form onSubmit={handleUpdateStatus}>
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Update Donation Status
                  </h3>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition"
                  >
                    {" "}
                    <CloseIcon className="w-5 h-5" />{" "}
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {modalError && (
                    <AlertMessage message={modalError} type="error" />
                  )}
                  <div className="text-sm">
                    <strong>Item:</strong>{" "}
                    <span className="capitalize">
                      {updateTarget.itemType === "device"
                        ? updateTarget.deviceType
                        : updateTarget.medicineName}
                    </span>
                    <br />
                    <strong>Donor:</strong>{" "}
                    {updateTarget.donor?.fullName || updateTarget.donor?.email}
                  </div>
                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center"
                    >
                      <ShieldCheck className="w-5 h-5 text-gray-400 mr-2" /> New
                      Status <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      id="status"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out appearance-none bg-white"
                    >
                      <option value="pending_approval">Pending Approval</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      {/* <option value="collected">Collected</option>
                                            <option value="delivered">Delivered</option> */}
                    </select>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition "
                  >
                    {" "}
                    Cancel{" "}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition "
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    {isSubmitting ? "Saving..." : "Save Status"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <motion.div
            key="deleteModalBackdrop"
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4"
            onClick={closeModal}
          >
            <motion.div
              key="deleteModalContent"
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white p-6 rounded-lg shadow-xl max-w-sm mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Confirm Deletion
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete this donation? This action
                  will also remove the image from storage and cannot be undone.
                </p>
                {modalError && (
                  <AlertMessage message={modalError} type="error" />
                )}
              </div>
              <div className="flex justify-center space-x-3 mt-6">
                <button
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50"
                >
                  {" "}
                  Cancel{" "}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  {isSubmitting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViewDonations;