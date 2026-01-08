import React from "react";

// A reusable component for the Donor/Receiver toggle switch
const AuthToggle = ({ userType, setUserType }) => {
  const baseStyle =
    "w-1/2 py-3 px-4 rounded-full font-semibold transition-all duration-300";
  const activeStyle = "bg-indigo-600 text-white shadow-md";
  const inactiveStyle = "bg-gray-200 text-gray-700 hover:bg-gray-300";

  return (
    <div className="w-full max-w-sm p-1.5 flex bg-gray-200 rounded-full">
      <button
        onClick={() => setUserType("donor")}
        className={`${baseStyle} ${
          userType === "donor" ? activeStyle : inactiveStyle
        }`}
      >
        I am a Donor
      </button>
      <button
        onClick={() => setUserType("receiver")}
        className={`${baseStyle} ${
          userType === "receiver" ? activeStyle : inactiveStyle
        }`}
      >
        I am a Receiver
      </button>
    </div>
  );
};

export default AuthToggle;
