const express = require("express");
const router = express.Router();
// Import validation functions (check for body/query, param for URL parameters)
const { check, param } = require("express-validator");
const multer = require("multer"); // Import multer for error handling type check

// Import controller functions for all donation actions
const {
  addDeviceDonation,
  addMedicineDonation,
  getDonations,
  getDonationById,
  updateDonationStatus,
  deleteDonation,
  searchDonations,
  requestDonation, 
  updateDonationStatusByDonor, 
} = require("../controllers/donation.controller");

// Import middleware for authentication, authorization, and file upload
const { protect, isAdmin } = require("../middleware/auth.middleware"); // User login check + Admin check
const upload = require("../middleware/upload.middleware"); // Image upload handler (memory storage)

// --- Validation Rules ---

// Validation for Device Donation POST request
const deviceDonationValidation = [
  check("deviceType", "Device type (e.g., wheelchair, crutches) is required")
    .not()
    .isEmpty()
    .trim()
    .escape(),
  check(
    "description",
    "A brief description of the item and its condition is required"
  )
    .not()
    .isEmpty()
    .trim()
    .isLength({ max: 500 })
    .escape(),
  check("condition", "Please select the item's condition").isIn([
    "new",
    "good",
    "fair",
    "needs_repair",
  ]),
];

// Validation for Medicine Donation POST request
const medicineDonationValidation = [
  check("medicineName", "Medicine name is required")
    .not()
    .isEmpty()
    .trim()
    .escape(),
  check("quantity", "Quantity is required (e.g., 1 Strip, 100ml)")
    .not()
    .isEmpty()
    .trim()
    .escape(),
  check("strength", "Strength should be text (e.g., 500mg)")
    .optional({ checkFalsy: true })
    .trim()
    .escape(),
  // AI results (aiExpiryText, aiExpiryValid, aiParsedDate) are passed as strings, specific validation not typically needed here
];

// Validation for ID parameter in URL (ensures it's a valid MongoDB ObjectId format)
const idParamValidation = [
  param("id", "Invalid Donation ID format").isMongoId(),
];
// --- Validation for Donor Status Update ---
const donorStatusUpdateValidation = [
     // FIX: Add 'delivered' to the list of allowed statuses
     check('status', 'Invalid status').isIn(['collected', 'delivered']) 
];
// Validation for status update PUT request body
const statusUpdateValidation = [
  check("status", "Status field is required").not().isEmpty(),
  check("status", "Invalid status value provided").isIn([
    "pending_approval",
    "approved",
    "rejected",
    "collected",
    "delivered",
    // Add other valid statuses as needed
  ]),
];

// --- Middleware for Handling Multer Upload and Errors ---
// This function wraps upload.single to provide better error messages directly in the route chain
const handleUpload = (req, res, next) => {
  // Execute multer's single file upload logic for the field named 'image'
  upload.single("image")(req, res, function (err) {
    // Handle specific Multer errors (file size, file type)
    if (err instanceof multer.MulterError) {
      let message = "File upload error.";
      if (err.code === "LIMIT_FILE_SIZE")
        message = "Image file is too large (Max 5MB).";
      if (err.code === "LIMIT_UNEXPECTED_FILE")
        message = "Invalid file type. Only images are allowed.";
      console.error("Multer Error:", err.code);
      // Return validation-style error response
      return res
        .status(400)
        .json({ errors: [{ msg: message, param: "image" }] });
    }
    // Handle other unexpected errors during upload
    else if (err) {
      console.error("Unknown Upload Error:", err);
      return res
        .status(500)
        .json({
          errors: [
            { msg: "Unexpected error during file upload.", param: "image" },
          ],
        });
    }
    // Check if a file was actually uploaded (Multer adds req.file if successful)
    if (!req.file) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Image file is required.", param: "image" }] });
    }
    // If everything is okay, proceed to the next middleware (validation or controller)
    next();
  });
};

// --- Define Donation Routes ---

// @route   POST /api/donations/device
// @desc    Add a new medical device donation
// @access  Private (Donors)
router.post(
  "/device",
  protect, // 1. Ensure user is logged in
  handleUpload, // 2. Handle image upload and check for errors
  deviceDonationValidation, // 3. Validate text fields in req.body
  addDeviceDonation // 4. Execute controller logic
);

// @route   POST /api/donations/medicine
// @desc    Add a new medicine donation
// @access  Private (Donors)
router.post(
  "/medicine",
  protect, // 1. Ensure user is logged in
  handleUpload, // 2. Handle image upload and check for errors
  medicineDonationValidation, // 3. Validate text fields in req.body
  addMedicineDonation // 4. Execute controller logic
);



// --- NEW SEARCH ROUTE ---
// @route   GET /api/donations/search
// @desc    Search for donations matching receiver's city
// @access  Private (Receivers)
router.get("/search", protect, searchDonations); // 'protect' is sufficient if

// @route   GET /api/donations
// @desc    Get donations (list is filtered based on user role in controller)
// @access  Private (Logged-in users)
router.get(
  "/",
  protect, // Ensure user is logged in
  getDonations // Controller handles role-based filtering
);

// @route   GET /api/donations/:id
// @desc    Get a single donation by its ID
// @access  Private (Admin or Owner Donor)
router.get(
  "/:id",
  protect, // Ensure user is logged in
  idParamValidation, // Validate the :id parameter format
  getDonationById // Controller handles fetching and access control
);

// @route   PUT /api/donations/:id/status
// @desc    Update the status of a specific donation
// @access  Private (Admin Only)
router.put(
  "/:id/status",
  protect, // Ensure user is logged in
  isAdmin, // Ensure user is an Admin
  idParamValidation, // Validate the :id parameter format
  statusUpdateValidation, // Validate the 'status' field in req.body
  updateDonationStatus // Execute controller logic
);

// @route   DELETE /api/donations/:id
// @desc    Delete a specific donation
// @access  Private (Admin Only)
router.delete(
  "/:id",
  protect, // Ensure user is logged in
  isAdmin, // Ensure user is an Admin
  idParamValidation, // Validate the :id parameter format
  deleteDonation // Execute controller logic (includes Cloudinary deletion)
);

// --- NEW RECEIVER ROUTE ---
// PUT /api/donations/:id/request (Receiver requests item)
router.put(
    "/:id/request",
    protect, // Must be logged in (controller checks for 'receiver' role)
    idParamValidation,
    requestDonation
);

// --- NEW DONOR ROUTE ---
// PUT /api/donations/:id/donor-status (Donor updates status)
router.put(
    "/:id/donor-status",
    protect, // Must be logged in (controller checks ownership)
    idParamValidation,
    donorStatusUpdateValidation, // Checks for valid status
    updateDonationStatusByDonor
);
module.exports = router; // Export the configured router
