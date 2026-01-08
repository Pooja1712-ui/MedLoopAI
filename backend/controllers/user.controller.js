const User = require("../models/User.model");
const { validationResult } = require("express-validator");

// @desc    Get current logged-in user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    // req.user.id comes from the 'protect' middleware
    // Exclude password field from the result
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user); // Send the full user profile (without password)
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Destructure all possible updatable fields from the request body
  const {
    email,
    fullName,
    mobileNumber,
    organizationName,
    address, // Expecting { street, city, state, pincode }
    contactPerson,
    registrationNumber,
    website,
  } = req.body;

  try {
    // Find the user making the request using the ID from the token
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // --- Update Common Fields ---
    // Update email if provided and different
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      // Ensure the new email isn't already taken by *another* user
      if (emailExists && emailExists._id.toString() !== user.id) {
        return res.status(400).json({ msg: "Email already in use" });
      }
      user.email = email;
    }

    // --- Update Address (Common for Donor/Receiver) ---
    // Check if address data is provided and if the user role allows it
    if (address && (user.role === "donor" || user.role === "receiver")) {
      // Initialize user.address if it doesn't exist to prevent errors
      if (!user.address) user.address = {};
      // Merge the new address data into the existing address object
      // This allows partial updates (e.g., only updating the city)
      user.address = Object.assign(user.address, address);
    }

    // --- Update Other Role-Specific Fields ---
    // For Donors or Admins
    if (user.role === "donor" || user.role === "admin") {
      // Use 'undefined' check to allow clearing the field with an empty string
      if (fullName !== undefined) user.fullName = fullName;
      if (mobileNumber !== undefined) user.mobileNumber = mobileNumber;
      // Address is handled above
    }
    // For Receivers
    else if (user.role === "receiver") {
      if (organizationName !== undefined)
        user.organizationName = organizationName;
      // Address is handled above

      // Update nested contactPerson object safely
      if (contactPerson) {
        if (!user.contactPerson) user.contactPerson = {};
        user.contactPerson = Object.assign(user.contactPerson, contactPerson);
      }
      // Update optional fields, allowing them to be cleared
      if (registrationNumber !== undefined)
        user.registrationNumber = registrationNumber;
      if (website !== undefined) user.website = website;
    }

    // Save the updated user document (this will trigger pre-save hooks like password hashing if password were changed)
    const updatedUser = await user.save();

    // --- Prepare and Send Response ---
    // Construct the response object, excluding sensitive info like password
    let responseUser = {
      id: updatedUser._id,
      email: updatedUser.email,
      role: updatedUser.role,
    };

    // Add role-specific details to the response
    if (updatedUser.role === "donor" || updatedUser.role === "admin") {
      responseUser.name = updatedUser.fullName; // Use 'name' consistently in frontend
      responseUser.mobileNumber = updatedUser.mobileNumber;
      // Include address for donor response
      if (updatedUser.role === "donor") {
        responseUser.address = updatedUser.address;
      }
    } else if (updatedUser.role === "receiver") {
      responseUser.name = updatedUser.organizationName; // Use 'name' consistently
      responseUser.address = updatedUser.address;
      responseUser.contactPerson = updatedUser.contactPerson;
      responseUser.registrationNumber = updatedUser.registrationNumber;
      responseUser.website = updatedUser.website;
    }

    res.json(responseUser); // Send the updated user details
  } catch (error) {
    console.error("Error updating user profile:", error.message);
    // Handle specific errors like validation errors from Mongoose
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ msg: `Validation Error: ${error.message}` });
    }
    res.status(500).send("Server Error"); // Generic server error
  }
};

// @desc    Get all users with the 'donor' role
// @route   GET /api/users/donors
// @access  Private/Admin
exports.getAllDonors = async (req, res) => {
  try {
    const donors = await User.find({ role: "donor" }).select("-password");
    res.json(donors);
  } catch (error) {
    console.error("Error fetching donors:", error.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Get all users with the 'receiver' role
// @route   GET /api/users/receivers
// @access  Private/Admin
exports.getAllReceivers = async (req, res) => {
  try {
    const receivers = await User.find({ role: "receiver" }).select("-password");
    res.json(receivers);
  } catch (error) {
    console.error("Error fetching receivers:", error.message);
    res.status(500).send("Server Error");
  }
};
