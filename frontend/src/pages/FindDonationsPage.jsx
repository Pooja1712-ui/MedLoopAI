import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx"; // Adjust path if needed
import { Link, useNavigate } from "react-router-dom"; // useNavigate is already imported
import {
  Loader2,
  AlertCircle,
  Inbox,
  List,
  Map as MapIcon, // Renamed 'Map' to 'MapIcon' to avoid conflict
  Package,
  Pill,
  Send,
  MapPin,
} from "lucide-react";
// Import Leaflet components
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// Import Leaflet CSS
// e.g., import 'leaflet/dist/leaflet.css';

// --- Helper Components ---

// --- NEW: Skeleton Loader for a modern loading UI ---
const DonationCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden flex flex-col h-full">
    {/* Image Skeleton */}
    <div className="h-48 w-full flex-shrink-0 bg-gray-200 animate-pulse"></div>
    <div className="p-4 flex flex-col flex-grow justify-between">
      {/* Top Details Skeleton */}
      <div>
        <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mb-3"></div>
        <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-1"></div>
        <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
      </div>
      {/* Bottom Details & Action Skeleton */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
        {/* Action Button Skeleton */}
        <div className="mt-4">
          <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse"></div>
        </div>
      </div>
    </div>
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
// --- End Helper Components ---

// Read API URL from environment variable (Vite or CRA)
const API_BASE_URL =
  import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL;
const DONATION_API_URL = API_BASE_URL
  ? API_BASE_URL.replace("/auth", "/donations")
  : "/api/donations";
const USER_API_URL = API_BASE_URL
  ? API_BASE_URL.replace("/auth", "/users")
  : "/api/users";

// --- Geocoding Function (uses public API) ---
const geocodeAddress = async (address) => {
  if (!address) return null;
  const { street, city, state, pincode } = address;
  const query = [street, city, state, pincode].filter(Boolean).join(", ");
  if (!query) return null;

  // Simple cache to avoid re-geocoding the same address
  if (geocodeAddress.cache.has(query)) {
    return geocodeAddress.cache.get(query);
  }
  // Wait 1 second before *each* new request to respect rate limit
  await new Promise((resolve) => setTimeout(resolve, 1000));

  try {
    const res = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
      )}&format=json&limit=1`
    );
    if (res.data && res.data[0]) {
      const coords = {
        lat: parseFloat(res.data[0].lat),
        lon: parseFloat(res.data[0].lon),
      };
      geocodeAddress.cache.set(query, coords); // Cache result
      return coords;
    }
    geocodeAddress.cache.set(query, null); // Cache null result
    return null;
  } catch (err) {
    console.warn(`Geocoding failed for address "${query}":`, err.message);
    geocodeAddress.cache.set(query, null);
    return null; // Fail gracefully
  }
};
geocodeAddress.cache = new Map(); // Use native JS Map for caching

// --- Donation Card for List View (UPDATED with Request Logic) ---
const DonationCard = ({ donation, onDonationUpdate }) => {
  const { token } = useAuth();
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestError, setRequestError] = useState("");
  const navigate = useNavigate(); // <-- ADD THIS LINE to get navigation function

  const isDevice = donation.itemType === "device";
  const itemName = isDevice
    ? donation.deviceType || "Device"
    : donation.medicineName || "Medicine";

  const handleRequestItem = async () => {
    if (
      !window.confirm(
        "Are you sure you want to request this item? This will notify the donor and reserve the item for you."
      )
    ) {
      return;
    }
    setIsRequesting(true);
    setRequestError("");
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // Call the new 'request' endpoint
      const res = await axios.put(
        `${DONATION_API_URL}/${donation._id}/request`,
        {},
        config
      );

      // Update the parent component's state
      onDonationUpdate(res.data);

      // --- REDIRECT: Navigate to /my-requests on success ---
      navigate("/my-requests"); // <-- ADD THIS LINE
      // ----------------------------------------------------
    } catch (err) {
      console.error("Failed to request donation:", err);
      setRequestError(
        err.response?.data?.msg ||
          "Failed to send request. Item may no longer be available."
      );
    } finally {
      setIsRequesting(false); // Stop loading indicator (though redirect will happen first)
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden flex flex-col h-full transition-shadow duration-300 hover:shadow-lg">
      {/* Image */}
      <div className="h-48 w-full flex-shrink-0">
        <img
          className="h-full w-full object-cover"
          src={donation.imageUrl}
          alt={itemName}
        />
      </div>

      <div className="p-4 flex flex-col flex-grow justify-between">
        {/* Top Details */}
        <div>
          <h3
            className="text-lg font-semibold text-gray-900 capitalize truncate"
            title={itemName}
          >
            {isDevice ? (
              <Package className="w-5 h-5 mr-2 inline-block text-indigo-600" />
            ) : (
              <Pill className="w-5 h-5 mr-2 inline-block text-indigo-600" />
            )}
            {itemName}
          </h3>
          {isDevice ? (
            <p className="text-sm text-gray-600 capitalize mt-1">
              Condition: {donation.condition}
            </p>
          ) : (
            <p className="text-sm text-gray-600 mt-1">
              Quantity: {donation.quantity}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-2 line-clamp-2 min-h-[2.5rem]">
            {isDevice
              ? donation.description
              : `Strength: ${donation.strength || "N/A"}`}
          </p>
        </div>

        {/* Bottom Details & Action */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-700 font-medium">
            {donation.donor?.fullName || "Anonymous Donor"}
          </p>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0 text-gray-400" />
            <span>
              {donation.donor?.address?.city},{" "}
              {donation.donor?.address?.state}
            </span>
          </div>

          {/* Action Button */}
          <div className="mt-4">
            {donation.status === "approved" && (
              <button
                onClick={handleRequestItem}
                disabled={isRequesting}
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
              >
                {isRequesting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {isRequesting ? "Sending..." : "Request Item"}
              </button>
            )}
            {donation.status === "requested" && (
              <button
                disabled
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-md cursor-not-allowed"
              >
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Request Sent
              </button>
            )}
            {(donation.status === "collected" ||
              donation.status === "delivered") && (
              <button
                disabled
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-500 text-sm font-medium rounded-md cursor-not-allowed"
              >
                Unavailable
              </button>
            )}
            {requestError && (
              <p className="text-xs text-red-600 mt-2 text-center">
                {requestError}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---
const FindDonationsPage = () => {
  const [donations, setDonations] = useState([]);
  // --- UPDATED: markers state now holds grouped donations ---
  const [markers, setMarkers] = useState([]); // Shape: { coords: [lat, lon], donations: [...] }[]
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default: India
  const [mapZoom, setMapZoom] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const { token, user } = useAuth();
  const navigate = useNavigate();

  // Redirect donors
  useEffect(() => {
    if (user && user.role === "donor") {
      console.warn("Donor access restricted. Redirecting.");
      navigate("/donor-dashboard");
    }
  }, [user, navigate]);

  // Fetch receiver location to center map
  useEffect(() => {
    if (!token || user?.role !== "receiver") return;
    const fetchReceiverLocation = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`${USER_API_URL}/profile`, config);
        if (res.data?.address) {
          const coords = await geocodeAddress(res.data.address);
          if (coords) {
            setMapCenter([coords.lat, coords.lon]);
            setMapZoom(11); // Zoom in to their location
          }
        }
      } catch (err) {
        console.warn("Could not fetch receiver location:", err.message);
      }
    };
    fetchReceiverLocation();
  }, [token, user]);

  // Fetch donations
  useEffect(() => {
    if (!token || user?.role !== "receiver") {
      setIsLoading(false);
      if (user && user.role !== "receiver") {
        setError("Only receivers can access this page.");
      }
      return;
    }
    const fetchDonations = async () => {
      setIsLoading(true);
      setError("");
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`${DONATION_API_URL}/search`, config);
        if (Array.isArray(res.data)) {
          setDonations(res.data);
        } else {
          setError("Received unexpected data format.");
        }
      } catch (err) {
        console.error("Failed to fetch donations:", err);
        setError(err.response?.data?.msg || "Failed to load donations.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDonations();
  }, [token, user]);

  // --- UPDATED: Geocode donations and group by address ---
  useEffect(() => {
    if (donations.length === 0 || viewMode !== "map") {
      setMarkers([]);
      return;
    }
    let isMounted = true;
    const geocodeAll = async () => {
      console.log("Geocoding and grouping donation addresses...");

      // Use a Map to group donations by coordinate string
      const groupedMarkers = new Map();

      const geocodePromises = donations.map(async (donation) => {
        if (!donation.donor?.address) {
          return null;
        }
        const coords = await geocodeAddress(donation.donor.address);
        if (!coords) {
          return null;
        }
        return { donation, coords };
      });

      const results = await Promise.all(geocodePromises);

      if (isMounted) {
        // Process results to group them
        results.forEach((result) => {
          if (result) {
            const { donation, coords } = result;
            const key = `${coords.lat},${coords.lon}`; // Unique key for this location

            if (!groupedMarkers.has(key)) {
              // First item at this location
              groupedMarkers.set(key, {
                coords: [coords.lat, coords.lon],
                donations: [],
              });
            }
            // Add donation to this location's list
            groupedMarkers.get(key).donations.push(donation);
          }
        });

        const newMarkers = Array.from(groupedMarkers.values());
        setMarkers(newMarkers);
        console.log(
          `Successfully geocoded and grouped ${donations.length} donations into ${newMarkers.length} map markers.`
        );
      }
    };

    geocodeAll();

    return () => {
      isMounted = false;
    };
  }, [donations, viewMode]); // Re-run if donations or viewMode change

  // Memoize map
  const memoizedMap = useMemo(
    () => (
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true} // Allow scroll zoom
        style={{
          height: "600px",
          width: "10S0%",
          borderRadius: "8px",
          zIndex: 0,
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* --- UPDATED: Map over grouped markers --- */}
        {markers.map((marker) => (
          <Marker key={marker.coords.join("-")} position={marker.coords}>
            <Popup>
              {marker.donations.length === 1 ? (
                // --- Single Item Popup ---
                <div>
                  <h4 className="font-semibold capitalize text-base">
                    {marker.donations[0].itemType === "device"
                      ? marker.donations[0].deviceType
                      : marker.donations[0].medicineName}
                  </h4>
                  <p className="text-sm">
                    From: {marker.donations[0].donor.fullName || "Donor"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {marker.donations[0].donor.address.city}
                  </p>
                </div>
              ) : (
                // --- NEW: Multi-Item Popup ---
                <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                  <h4 className="font-semibold text-base mb-2">
                    {marker.donations.length} Items at this Location
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {marker.donations.map((donation)=> (
                      <li key={donation._id} className="text-sm capitalize">
                        {donation.itemType === "device"
                          ? donation.deviceType
                          : donation.medicineName}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    ),
    [mapCenter, mapZoom, markers]
  );

  // Handler to update local state when an item is requested
  const handleDonationUpdate = (updatedDonation) => {
    setDonations((prevDonations) =>
      prevDonations.map((d) =>
        d._id === updatedDonation._id ? updatedDonation : d
      )
    );
    // Note: This will also trigger the marker-generation useEffect
    // if the view is 'map', ensuring map popups are up-to-date.
  };

  // --- Render Logic ---
  if (user?.role === "donor") {
    // Show skeleton while redirecting
    return (
      <div className="bg-gray-50 min-h-screen p-12">
        <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
          {[...Array(3)].map((_, i) => (
            <DonationCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Donation Matching Hub
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Discover and request items shared by donors near you.
            </p>
          </div>
          {/* View Toggle Buttons */}
          <div className="flex-shrink-0 flex space-x-2 p-1 bg-gray-200 rounded-lg">
            <button
              onClick={() => setViewMode("list")}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                viewMode === "list"
                  ? "bg-white text-indigo-700 shadow"
                  : "bg-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <List className="w-4 h-4 mr-2" /> List View
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                viewMode === "map"
                  ? "bg-white text-indigo-700 shadow"
                  : "bg-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <MapIcon className="w-4 h-4 mr-2" /> Map View
            </button>
          </div>
        </div>

        {/* --- UPDATED: Loading State (Skeleton) --- */}
        {isLoading && (
          <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
            {[...Array(6)].map((_, i) => (
              <DonationCardSkeleton key={i} />
            ))}
          </div>
        )}

        {error && <ErrorMessage message={error} />}

        {!isLoading && !error && (
          <>
            {donations.length === 0 ? (
              // --- UPDATED: Empty State ---
              <div className="text-center p-12 text-gray-500 bg-white rounded-lg shadow-sm border max-w-lg mx-auto">
                <Inbox className="w-16 h-16 mx-auto text-indigo-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800">
                  No Donations Found
                </h3>
                <p className="mt-2 text-sm">
                  There are no approved donations available in your area right
                  now. Please check back later or update your profile location.
                </p>
                <Link
                  to="/receiver-dashboard"
                  className="mt-6 inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition duration-150 ease-in-out"
                >
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <div>
                {viewMode === "list" && (
                  <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
                    {donations.map((donation) => (
                      <DonationCard
                        key={donation._id}
                        donation={donation}
                        onDonationUpdate={handleDonationUpdate}
                      />
                    ))}
                  </div>
                )}
                {viewMode === "map" && (
                  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-2">
                    {markers.length === 0 && !isLoading && (
                      <div className="p-4 text-center text-sm text-gray-500 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Geocoding donation locations for the map... (This may
                        take a moment)
                      </div>
                    )}
                    {memoizedMap}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FindDonationsPage;