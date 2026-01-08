import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  LayoutDashboard,
  Users,
  HandHeart, // Represents Donors/Receivers
  Package, // Represents Donations
  Newspaper,
  PlusSquare,
  LogOut,
  Menu,
  X,
  HeartHandshake,
} from "lucide-react";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar

  // Ensure only admins can access this layout
  // Note: This adds an extra layer of security, ProtectedLayout already checks login
  React.useEffect(() => {
    if (user && user.role !== "admin") {
      // Redirect non-admins away
      navigate("/");
    }
  }, [user, navigate]);

  const sidebarLinks = [
    {
      name: "Overview",
      href: "/admin-dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    { name: "Donors", href: "donors", icon: HandHeart },
    { name: "Receivers", href: "receivers", icon: Users },
    { name: "Donations", href: "donations", icon: Package },
    { name: "View Blogs", href: "blogs", icon: Newspaper },
    { name: "Add Blog", href: "blogs/add", icon: PlusSquare },
  ];

  const baseLinkClass =
    "flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-200";
  const activeLinkClass = "bg-indigo-100 text-indigo-700 font-semibold";

  // If user is not an admin yet (still loading or check failed), show minimal UI
  if (!user || user.role !== "admin") {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading or unauthorized...
      </div>
    ); // Or a proper loading spinner
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:flex-col`}
      >
        {/* Logo and Close Button (Mobile) */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <NavLink
            to="/admin-dashboard"
            className="flex items-center space-x-2 text-indigo-600"
          >
            <HeartHandshake className="w-8 h-8" />
            <span className="text-xl font-bold">MedLoopAi Admin</span>
          </NavLink>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1 text-gray-500 rounded hover:bg-gray-200 focus:outline-none focus:ring"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.href}
              end={link.exact} // Use 'end' for exact match on the overview link
              className={({ isActive }) =>
                `${baseLinkClass} ${isActive ? activeLinkClass : ""}`
              }
              onClick={() => setIsSidebarOpen(false)} // Close sidebar on link click (mobile)
            >
              <link.icon className="w-5 h-5 mr-3" />
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Footer section in Sidebar */}
        <div className="px-4 py-3 border-t">
          <p className="text-sm font-medium text-gray-700 truncate">
            {user.name || user.email}
          </p>
          <button
            onClick={logout}
            className="flex items-center w-full mt-2 px-4 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black opacity-50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar for mobile toggle */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b md:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1 text-gray-500 rounded hover:bg-gray-200 focus:outline-none focus:ring"
          >
            <Menu className="w-6 h-6" />
          </button>
          <NavLink
            to="/admin-dashboard"
            className="flex items-center space-x-2 text-indigo-600"
          >
            <HeartHandshake className="w-7 h-7" />
            <span className="text-lg font-bold">Admin</span>
          </NavLink>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          {/* Outlet renders the nested admin route components */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
