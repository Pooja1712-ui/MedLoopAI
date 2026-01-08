import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// This layout ensures the Navbar and Footer are on every page.
// The "flex-grow" on main pushes the footer to the bottom.
const MainLayout = () => {
  return (
    <div className="font-sans antialiased text-gray-800 bg-white flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-wrap">
        <Outlet /> {/* Child pages (Landing, Login, etc.) render here */}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
