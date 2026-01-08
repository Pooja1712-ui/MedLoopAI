import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, NavLink } from "react-router-dom"; // Use NavLink for active styling
import { HashLink } from "react-router-hash-link"; // Assuming this is installed
import {
  Menu,
  X,
  HeartHandshake,
  LogOut,
  User,
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  List,
  MapPin,
} from "lucide-react"; // Make sure lucide-react is installed
import { useAuth } from "../context/AuthContext.jsx"; // Adjust path if needed

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false); // State for profile dropdown
  const { user, logout } = useAuth();
  const profileMenuRef = useRef(null); // Ref for detecting outside clicks

  // --- Close profile dropdown when clicking outside ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close if click is outside the profile menu ref
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    // Add listener only when dropdown is open
    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    // Cleanup listener on component unmount or when dropdown closes
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  // --- Define Navigation Links ---
  const baseNavLinks = [
    { name: "Home", href: "/" },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "Features", href: "/#features" },
    { name: "Impact", href: "/#impact" },
    { name: "Awareness", href: "/blogs", icon: BookOpen },
  ];

  // --- User Specific Links (Populated based on login status/role) ---
  const userSpecificLinks = []; // For main nav area
  const profileLinks = []; // For profile dropdown

  if (user) {
    // Add "Add Donation" only for donors
    if (user.role === "donor") {
      userSpecificLinks.push({
        name: "Add Donation",
        href: "/add-donation",
        icon: PlusCircle,
      });
      userSpecificLinks.push({
        name: "My Donations",
        href: "/my-donations",
        icon: List,
      });
    }
    // --- ADD THIS BLOCK ---
    if (user.role === "receiver") {
      userSpecificLinks.push({
        name: "Find Donations",
        href: "/find-donations",
        icon: MapPin,
      }); // Or use 'Package' icon
      userSpecificLinks.push({
        name: "My Requests",
        href: "/my-requests",
        icon: List,
      });
      profileLinks.push({
        name: "Find Donations",
        href: "/find-donations",
        icon: MapPin,
      });
      profileLinks.push({
        name: "My Requests",
        href: "/my-requests",
        icon: List,
      });
    }
    // Determine dashboard path
    const dashboardPath =
      user.role === "admin"
        ? "/admin-dashboard"
        : user.role === "donor"
        ? "/donor-dashboard"
        : null; // Receivers currently don't have a separate dashboard link in nav

    // Add Dashboard to profile dropdown if applicable
    if (dashboardPath) {
      profileLinks.push({
        name: "Dashboard",
        href: dashboardPath,
        icon: LayoutDashboard,
      });
      // Optional: Add Dashboard to main nav if desired (Uncomment below)
      // userSpecificLinks.push({ name: "Dashboard", href: dashboardPath, icon: LayoutDashboard });
    }
    // Add Profile link to dropdown
    profileLinks.push({ name: "Profile", href: "/profile", icon: User });
    // Optional: Also add Profile to main nav if desired (Uncomment below)
    // userSpecificLinks.push({ name: "Profile", href: "/profile", icon: User });
  }

  // Combine links for rendering in main nav areas
  const allNavLinks = [...baseNavLinks, ...userSpecificLinks];

  // --- Helper to get Initials for Avatar ---
  const getInitials = (email) => (email ? email.charAt(0).toUpperCase() : "?");

  // --- Animation Variants for Dropdown ---
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } },
  };

  // --- Render Component ---
  return (
    <motion.nav
      // Initial animation for the navbar itself
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      // Styling for sticky navbar with blur effect
      className="sticky top-0 z-50 w-full bg-white shadow-md bg-opacity-95 backdrop-blur-sm"
    >
      <div className="container px-4 py-4 mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <HeartHandshake className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-800">MedLoopAi</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden space-x-6 lg:space-x-8 md:flex flex-grow justify-center px-4">
            {allNavLinks.map((link) => {
              // Choose Link component based on whether it's a hash link
              const LinkComponent = link.href.includes("#")
                ? HashLink
                : NavLink;
              return (
                <LinkComponent
                  smooth={link.href.includes("#")} // Enable smooth scroll only for HashLink
                  key={link.name}
                  to={link.href}
                  // Apply active styles using NavLink's isActive prop
                  className={(
                    { isActive } // Only NavLink receives isActive
                  ) =>
                    `flex items-center px-1 py-1 text-sm font-medium transition-colors duration-200 border-b-2 hover:text-indigo-600 hover:border-indigo-300 ${
                      isActive && !link.href.includes("#")
                        ? "text-indigo-600 border-indigo-600" // Active state
                        : "text-gray-700 border-transparent" // Default state
                    }`
                  }
                  // Provide default className for HashLink which doesn't get isActive
                  {...(!link.href.includes("#")
                    ? {}
                    : {
                        className:
                          "flex items-center px-1 py-1 text-sm font-medium text-gray-700 transition-colors duration-200 hover:text-indigo-600 border-b-2 border-transparent hover:border-indigo-300",
                      })}
                >
                  {/* Render icon if provided */}
                  {link.icon && (
                    <link.icon className="w-4 h-4 mr-1.5 opacity-80 flex-shrink-0" />
                  )}
                  {link.name}
                </LinkComponent>
              );
            })}
          </div>

          {/* Authentication Section (Desktop) */}
          <div
            className="hidden md:flex items-center space-x-3 relative flex-shrink-0"
            ref={profileMenuRef}
          >
            {user ? ( // If user is logged in
              <>
                {/* Avatar Button */}
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-indigo-600 to-emerald-600 text-white rounded-full text-base font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow"
                  aria-haspopup="true"
                  aria-expanded={isProfileMenuOpen}
                >
                  {getInitials(user.email)}
                </button>

                {/* Profile Dropdown Menu */}
                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute top-full right-0 mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-1 z-50"
                    >
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.name || user.email}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {user.role}
                        </p>
                      </div>
                      {/* Dropdown Links (Dashboard, Profile) */}
                      <div className="py-1">
                        {profileLinks.map((link) => (
                          <Link
                            key={link.name}
                            to={link.href}
                            onClick={() => setIsProfileMenuOpen(false)} // Close dropdown on click
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                          >
                            <link.icon className="w-4 h-4 mr-3 text-gray-500 flex-shrink-0" />
                            {link.name}
                          </Link>
                        ))}
                      </div>
                      {/* Logout Button */}
                      <div className="border-t border-gray-100 py-1">
                        <button
                          onClick={() => {
                            logout();
                            setIsProfileMenuOpen(false);
                          }}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                        >
                          <LogOut className="w-4 h-4 mr-3 flex-shrink-0" /> Log
                          Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              // If user is logged out
              <>
                {/* Login Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/login"
                    className="px-5 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 bg-gray-100 rounded-full hover:bg-gray-200 block"
                  >
                    {" "}
                    Log In{" "}
                  </Link>
                </motion.div>
                {/* Register Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/register"
                    className="px-5 py-2 text-sm font-medium text-white transition-colors duration-200 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-sm block"
                  >
                    {" "}
                    Register{" "}
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile Menu Button (Hamburger) */}
          <div className="md:hidden flex-shrink-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-800"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-3 border-t border-gray-200 pt-4" // Use pt-4 instead of space-y for better control with AnimatePresence
            >
              <div className="px-2 space-y-1">
                {/* User Info Header (Mobile) */}
                {user && (
                  <div className="px-3 pt-1 pb-3 border-b border-gray-200 mb-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.name || user.email}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user.role}
                    </p>
                  </div>
                )}

                {/* All Navigation Links (Mobile) */}
                {allNavLinks.map((link) => {
                  const LinkComponent = link.href.includes("#")
                    ? HashLink
                    : NavLink;
                  return (
                    <LinkComponent
                      smooth={link.href.includes("#")}
                      key={`mobile-${link.name}`}
                      to={link.href}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2.5 text-base font-medium rounded-md hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-150 ${
                          isActive && !link.href.includes("#")
                            ? "bg-indigo-100 text-indigo-700"
                            : "text-gray-700"
                        }`
                      }
                      {...(!link.href.includes("#")
                        ? {}
                        : {
                            className:
                              "flex items-center px-3 py-2.5 text-base font-medium text-gray-700 rounded-md hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-150",
                          })}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.icon && (
                        <link.icon className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0" />
                      )}
                      {link.name}
                    </LinkComponent>
                  );
                })}

                {/* Profile/Dashboard Links (Mobile) */}
                {user &&
                  profileLinks.map((link) => (
                    <Link
                      key={`mobile-profile-${link.name}`}
                      to={link.href}
                      className="flex items-center px-3 py-2.5 text-base font-medium text-gray-700 rounded-md hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-150"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <link.icon className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0" />
                      {link.name}
                    </Link>
                  ))}

                {/* Authentication Buttons/Logout (Mobile) */}
                <div className="pt-4 pb-2 space-y-2 border-t border-gray-200 mt-2">
                  {user ? (
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-center w-full px-4 py-2 text-base font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors duration-150"
                    >
                      <LogOut className="w-5 h-5 mr-2 flex-shrink-0" /> Log Out
                    </button>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full px-4 py-2 text-base font-medium text-center text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-150"
                      >
                        {" "}
                        Log In{" "}
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full px-4 py-2 text-base font-medium text-center text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors duration-150 shadow-sm"
                      >
                        {" "}
                        Register{" "}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
