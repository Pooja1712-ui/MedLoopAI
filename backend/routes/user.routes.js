const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const {
  getUserProfile,
  updateUserProfile,
  getAllDonors,
  getAllReceivers,
} = require("../controllers/user.controller");
const { protect, isAdmin } = require("../middleware/auth.middleware");

// Validation rules for updating the user profile
const updateProfileValidation = [
  // Validate email if provided
  check("email", "Please include a valid email").optional().isEmail(),

  // Validate mobileNumber if provided (primarily for donors/admins)
  check("mobileNumber", "Please enter a valid 10-digit mobile number")
    .optional({ checkFalsy: true }) // Allows empty string or null
    .isLength({ min: 10, max: 10 })
    .withMessage("Mobile number must be 10 digits")
    .isNumeric()
    .withMessage("Mobile number must contain only digits"),

  // Validate pincode if address is provided (applies to donor/receiver)
  check("address.pincode", "Pincode should be a valid Indian pincode")
    .optional({ checkFalsy: true }) // Allows empty string within address object
    .if(check("address").exists()) // Only validate if address object itself is sent
    .isPostalCode("IN"),

  // Validate website URL if provided (primarily for receivers)
  check("website", "Please enter a valid URL (e.g., https://example.com)")
    .optional({ checkFalsy: true }) // Allows empty string
    .isURL(),
];

// --- Define User Routes ---

// GET /api/users/profile - Get current user's profile
router.get("/profile", protect, getUserProfile);

// PUT /api/users/profile - Update current user's profile
router.put("/profile", protect, updateProfileValidation, updateUserProfile);

// GET /api/users/donors - Get all donors (Admin only)
router.get("/donors", protect, isAdmin, getAllDonors);

// GET /api/users/receivers - Get all receivers (Admin only)
router.get("/receivers", protect, isAdmin, getAllReceivers);

module.exports = router;
