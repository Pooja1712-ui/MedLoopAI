import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
// Assuming AuthContext is located at src/context/AuthContext.jsx
import { useAuth } from "../context/AuthContext.jsx";
import axios from "axios";
import {
  User, Mail, Phone, Building, MapPin, Link as LinkIcon, Hash,
  Loader2, AlertCircle, CheckCircle,
} from "lucide-react";

// Read API URL from environment variable (ensure .env is set up correctly)
// Use process.env for Create React App compatibility
const API_BASE_URL = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL;
const USER_API_URL = API_BASE_URL
  ? API_BASE_URL.replace("/auth", "/users") // Adjust base URL for user endpoints
  : "/api/users"; // Fallback URL if env var is missing

// Animation variant for page load
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// --- Helper Components (Defined within the file for self-containment) ---

// Reusable Input Field Component with Icon
const InputField = ({ icon: Icon, label, id, name, type = "text", value, onChange, required = false, placeholder = "", maxLength, disabled = false, isOptional = false }) => (
  <div>
    {/* Label with required/optional indicators */}
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
      {isOptional && <span className="text-xs text-gray-500 ml-1">(Optional)</span>}
    </label>
    {/* Input wrapper with icon */}
    <div className="relative rounded-md shadow-sm">
      {Icon && ( // Render icon if provided
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
      )}
      <input
        type={type} id={id} name={name} value={value || ""} // Ensure value is controlled
        onChange={onChange} required={required} placeholder={placeholder}
        maxLength={maxLength} disabled={disabled}
        // Styling for input, adjusts padding based on icon presence and handles disabled state
        className={`block w-full border border-gray-300 rounded-lg py-2.5 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out ${
          Icon ? "pl-11" : "pl-4"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
      />
    </div>
  </div>
);

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-10">
    <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
    <span className="ml-3 text-gray-700">Loading profile...</span>
  </div>
);

// Alert Message Component for feedback
const AlertMessage = ({ message, type = "error" }) => {
  const isError = type === "error";
  return (
    // Animate presence/absence of the message
    <motion.div
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      // Styling based on error or success type
      className={`p-4 mb-6 text-sm rounded-lg border ${
        isError
          ? "bg-red-50 border-red-200 text-red-800"
          : "bg-green-50 border-green-200 text-green-800"
      }`}
      role="alert"
    >
      <div className="flex items-center">
        {isError ? (
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
        ) : (
          <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
        )}
        <span className="font-medium">{message}</span>
      </div>
    </motion.div>
  );
};
// --- End Helper Components ---

// Main Profile Page Component
const ProfilePage = () => {
  // Get user data, token, and setter function from Auth Context
  const { user, token, setUser: setAuthUser } = useAuth();
  // State for form data, initialized with structure including nested objects
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    mobileNumber: "",
    organizationName: "",
    address: { street: "", city: "", state: "", pincode: "" },
    contactPerson: { name: "", phone: "" },
    registrationNumber: "",
    website: "",
  });
  // State for loading indicators and feedback messages
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Effect runs on mount and when token/user changes to fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError("");
      setSuccess(""); // Clear previous messages
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`${USER_API_URL}/profile`, config);
        // Update form state with data from API response, using defaults for safety
        setFormData({
          email: res.data.email || "",
          fullName: res.data.fullName || "",
          mobileNumber: res.data.mobileNumber || "",
          organizationName: res.data.organizationName || "",
          address: { // Populate address fields
            street: res.data.address?.street || "",
            city: res.data.address?.city || "",
            state: res.data.address?.state || "",
            pincode: res.data.address?.pincode || "",
          },
          contactPerson: {
            name: res.data.contactPerson?.name || "",
            phone: res.data.contactPerson?.phone || "",
          },
          registrationNumber: res.data.registrationNumber || "",
          website: res.data.website || "",
        });
      } catch (err) {
        // Handle API fetch errors
        console.error("Failed to fetch profile:", err);
        setError(err.response?.data?.msg || "Failed to load profile data.");
      } finally {
        setIsLoading(false); // Done loading
      }
    };

    // Trigger fetch only if authenticated
    if (token && user) {
      fetchProfile();
    } else {
      setIsLoading(false);
      setError("You must be logged in to view your profile.");
    }
  }, [token, user]); // Effect dependencies

  // Generic handler for input changes, including nested state (e.g., address.city)
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) { // Handle nested state update
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else { // Handle top-level state update
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    // Clear feedback messages when user starts typing again
    setError("");
    setSuccess("");
  };

  // Handler for submitting the profile update form
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    setIsUpdating(true); // Set loading state for button
    setError("");
    setSuccess("");

    try {
      // Prepare Axios request configuration
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      // Construct the payload based on user role
      const payload = { email: formData.email };
      // Fields common to Donor/Admin
      if (user?.role === "donor" || user?.role === "admin") {
        payload.fullName = formData.fullName;
        payload.mobileNumber = formData.mobileNumber;
      }
      // Fields common to Donor/Receiver (Address)
      if (user?.role === 'donor' || user?.role === 'receiver') {
         payload.address = formData.address; // Include address object
      }
      // Fields specific to Receiver
      if (user?.role === "receiver") {
        payload.organizationName = formData.organizationName;
        // Address is already included above
        payload.contactPerson = formData.contactPerson;
        payload.registrationNumber = formData.registrationNumber;
        payload.website = formData.website;
      }

      // Send PUT request to the backend
      const res = await axios.put(`${USER_API_URL}/profile`, payload, config);

      // Prepare updated user object for AuthContext and local storage
      const updatedUserForContext = {
        ...user, // Preserve existing ID, role, etc.
        email: res.data.email,
        name: res.data.name, // 'name' is consistently fullName or organizationName from backend response
        // Conditionally add mobile number if relevant
        ...((user?.role === "donor" || user?.role === "admin") && {
          mobileNumber: res.data.mobileNumber,
        }),
        // Conditionally add address if relevant (could be useful in context)
         ...((user?.role === "donor" || user?.role === "receiver") && {
             address: res.data.address,
         }),
      };
      // Update the global state and persistent storage
      setAuthUser(updatedUserForContext);
      localStorage.setItem("user", JSON.stringify(updatedUserForContext));

      setSuccess("Profile updated successfully!"); // Display success message
    } catch (err) {
      // Handle errors during update (e.g., validation errors from backend)
      console.error("Profile update failed:", err);
      setError(
        err.response?.data?.errors?.[0]?.msg || // Display specific validation error
          err.response?.data?.msg || // Display general backend error message
          "Profile update failed." // Fallback error message
      );
    } finally {
      setIsUpdating(false); // Reset loading state for button
    }
  };

  // --- Conditional Rendering based on state ---

  // Show Loading Spinner
  if (isLoading) {
    return ( <div className="container mx-auto max-w-7xl px-4 py-16"> <LoadingSpinner /> </div> );
  }

  // Show Error if fetch failed and user isn't logged in
  if (error && !user) {
    return ( <div className="container mx-auto max-w-7xl px-4 py-16 text-center"> <AlertMessage message={error} type="error" /> </div> );
  }

  // Show Login Prompt if user is definitely not logged in (fallback)
  if (!user) {
    return ( <div className="container mx-auto max-w-7xl px-4 py-16 text-center text-red-600"> Please log in to view or edit your profile. </div> );
  }

  // --- Render Profile Form ---
  return (
    <motion.div
      variants={fadeIn} initial="hidden" animate="visible"
      className="container mx-auto max-w-4xl px-4 py-16 sm:py-24" // Page container
    >
      {/* Page Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl"> Your Profile </h1>
        <p className="mt-3 text-xl text-gray-600 capitalize"> Manage your {user.role} account details. </p>
      </div>

      {/* Form Container */}
      <form
        onSubmit={handleSubmit}
        className="space-y-8 bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100" // Form card styling
      >
        {/* Display Error/Success Messages */}
        {error && <AlertMessage message={error} type="error" />}
        {success && <AlertMessage message={success} type="success" />}

        {/* --- Personal Information Section --- */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2"> Personal Information </h2>
          <div className="space-y-4">
            {/* Email Field */}
            <InputField icon={Mail} label="Email Address" id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />

            {/* Fields for Donor/Admin */}
            {(user.role === "donor" || user.role === "admin") && (
              <>
                <InputField icon={User} label="Full Name" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
                <InputField icon={Phone} label="Mobile Number" id="mobileNumber" name="mobileNumber" type="tel" value={formData.mobileNumber} onChange={handleChange} maxLength="10" placeholder="e.g., 9876543210" isOptional />
              </>
            )}

            {/* Field for Receiver */}
            {user.role === "receiver" && (
              <InputField icon={Building} label="Organization Name" id="organizationName" name="organizationName" value={formData.organizationName} onChange={handleChange} required />
            )}
          </div>
        </section>

        {/* --- Address Section (Common for Donor/Receiver) --- */}
        {(user.role === 'donor' || user.role === 'receiver') && (
            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2"> Address </h2>
                <div className="space-y-4">
                    <InputField icon={MapPin} label="Street Address" id="address.street" name="address.street" value={formData.address?.street} onChange={handleChange} isOptional />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <InputField label="City" id="address.city" name="address.city" value={formData.address?.city} onChange={handleChange} isOptional />
                        <InputField label="State" id="address.state" name="address.state" value={formData.address?.state} onChange={handleChange} isOptional />
                        <InputField label="Pincode" id="address.pincode" name="address.pincode" type="text" value={formData.address?.pincode} onChange={handleChange} maxLength="6" isOptional />
                    </div>
                </div>
            </section>
        )}
        {/* --- End Address Section --- */}


        {/* --- Receiver ONLY Sections --- */}
        {user.role === "receiver" && (
          <>
            {/* Contact Person Section */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2"> Contact Person </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField icon={User} label="Name" id="contactPerson.name" name="contactPerson.name" value={formData.contactPerson?.name} onChange={handleChange} isOptional />
                <InputField icon={Phone} label="Phone" id="contactPerson.phone" name="contactPerson.phone" type="tel" value={formData.contactPerson?.phone} onChange={handleChange} maxLength="15" isOptional />
              </div>
            </section>

            {/* Other Information Section */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2"> Other Information </h2>
              <div className="space-y-4">
                <InputField icon={Hash} label="Registration Number" id="registrationNumber" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} isOptional />
                <InputField icon={LinkIcon} label="Website" id="website" name="website" type="url" value={formData.website} onChange={handleChange} placeholder="https://example.com" isOptional />
              </div>
            </section>
          </>
        )}

        {/* --- Update Button --- */}
        <div className="pt-5 border-t border-gray-200 mt-8"> {/* Added top border for separation */}
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
            disabled={isUpdating || !token} // Disable if updating or not logged in
            // Styling for the submit button, including disabled state
            className="w-full flex justify-center items-center px-6 py-3 font-semibold text-white transition-all duration-300 rounded-full bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? ( // Show loading indicator when updating
              <> <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Updating... </>
            ) : ( // Default button text
              "Update Profile"
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default ProfilePage; 

