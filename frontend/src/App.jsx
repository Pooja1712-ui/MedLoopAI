import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import your AuthProvider (as default import)
import AuthProvider from "./context/AuthContext";

// Import Layouts
import MainLayout from "./layouts/MainLayout";
import ProtectedLayout from "./layouts/ProtectedLayout";

// Import Pages (with correct paths)
import LandingPage from "./pages/LandingPage";
import LoginPage from "./layouts/LoginPage";
import RegisterPage from "./layouts/RegisterPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import DonorDashboard from "./pages/DonorDashboard";
import ProfilePage from "./pages/ProfilePage";
import AdminLayout from "./layouts/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import ViewDonors from "./pages/admin/ViewDonors";
import ViewReceivers from "./pages/admin/ViewReceivers";
import ViewDonations from "./pages/admin/ViewDonations";
import ViewBlogs from "./pages/admin/ViewBlogs";
import AddBlog from "./pages/admin/AddBlog";
import SingleBlogPostPage from "./pages/admin/SingleBlogPostPage";
import BlogListPage from "./pages/BlogListPage";
import DonatePage from "./pages/donar/DonatePage";
import MyDonations from "./pages/donar/MyDonations";
import FindDonationsPage from "./pages/FindDonationsPage";
import MyRequests from "./pages/MyRequests";



export default function App() {
  return (
    // FIX 1: BrowserRouter must be the outermost component
    <BrowserRouter>
      {/* FIX 2: AuthProvider must be INSIDE BrowserRouter */}
      <AuthProvider>
        <Routes>
          {/* --- Group 1: Standalone Pages (No Navbar/Footer) --- */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/blogs" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<SingleBlogPostPage />} />
          {/* --- Group 2: Public Pages (With Navbar/Footer) --- */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>

          {/* --- Group 3: Protected Pages (With Navbar/Footer) --- */}
          <Route element={<MainLayout />}>
            <Route element={<ProtectedLayout />}>
              <Route path="/donor-dashboard" element={<DonorDashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/add-donation" element={<DonatePage />} />
              <Route path="/my-donations" element={<MyDonations />} />
              <Route path="/my-requests" element={<MyRequests />} />
              <Route path="/find-donations" element={<FindDonationsPage />} />
            </Route>
          </Route>
          {/* --- Group 4: Protected Admin Pages (With Admin Sidebar) --- */}
          {/* This group uses AdminLayout (no Main Navbar/Footer) and ProtectedLayout */}
          <Route element={<ProtectedLayout />}>
            {" "}
            {/* Protects all nested admin routes */}
            <Route path="/admin-dashboard" element={<AdminLayout />}>
              {" "}
              {/* Use AdminLayout */}
              {/* Nested Routes for Admin Section */}
              <Route index element={<AdminOverview />} /> {/* Default view */}
              <Route path="donors" element={<ViewDonors />} />
              <Route path="receivers" element={<ViewReceivers />} />
              <Route path="donations" element={<ViewDonations />} />
              <Route path="blogs" element={<ViewBlogs />} />
              <Route path="blogs/add" element={<AddBlog />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
