import React from "react";

const AdminOverview = () => {
  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Admin Overview
      </h2>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-700">
          Welcome to the MedLoopAi Admin Dashboard! 👋 From here, you can manage
          users, track donations, and oversee blog content. Use the sidebar
          navigation to access different sections.
        </p>
        {/* Add summary stats or quick links here later */}
      </div>
    </div>
  );
};

export default AdminOverview;
