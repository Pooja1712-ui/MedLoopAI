const Donation = require("../models/Donation.model");
const User = require("../models/User.model");
const cloudinary = require("../config/cloudinary");
const axios = require("axios");
const FormData = require("form-data");
const { validationResult } = require("express-validator");

// Helper function to upload a buffer to Cloudinary
const uploadToCloudinary = (buffer, originalname, folder = "donations") => {
  // Generate a more robust unique public_id
  const filename = originalname
    ? originalname.split(".").slice(0, -1).join(".")
    : "image"; // Get filename without extension
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const public_id = `${folder}/${filename.replace(
    /[^a-zA-Z0-9]/g,
    "_"
  )}_${uniqueSuffix}`; // Sanitize filename

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "image", folder: folder, public_id: public_id },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          reject(new Error("Failed to upload image to Cloudinary."));
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(buffer);
  });
};

// @desc    Add a new medical device donation
// @route   POST /api/donations/device
// @access  Private (Donors)
exports.addDeviceDonation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  if (!req.file?.buffer)
    return res
      .status(400)
      .json({ errors: [{ msg: "Image file is required." }] });

  const { deviceType, description, condition } = req.body;
  const donorId = req.user.id;
  let aiResult = { status: "Skipped", validatedAt: new Date() };

  try {
    // --- AI Validation (/predict) ---
    const aiServiceUrl = process.env.AI_SERVICE_URL;
    const aiPredictEndpoint = `${aiServiceUrl}/predict`;

    if (aiServiceUrl && aiServiceUrl !== "http://localhost:5002") {
      // Check if configured
      console.log(
        `Sending image to AI Service (Predict) at ${aiPredictEndpoint}`
      );
      const formData = new FormData();
      formData.append("image", req.file.buffer, {
        filename: req.file.originalname || "upload.jpg",
      });
      try {
        const aiResponse = await axios.post(aiPredictEndpoint, formData, {
          headers: { ...formData.getHeaders() },
          timeout: 20000,
        });
        console.log("AI Service Response (Predict):", aiResponse.data);
        if (
          aiResponse.data.predictions &&
          aiResponse.data.predictions.length > 0
        ) {
          const topPrediction = aiResponse.data.predictions.reduce(
            (max, p) => (p.confidence > max.confidence ? p : max),
            aiResponse.data.predictions[0]
          );
          aiResult = {
            predictedClass: topPrediction.class,
            confidence: topPrediction.confidence,
            validatedAt: new Date(),
            status: "Completed",
          };
          if (aiResult.confidence < 0.6)
            console.warn("AI Prediction confidence low:", aiResult);
        } else {
          aiResult = {
            predictedClass: "unknown",
            confidence: 0,
            validatedAt: new Date(),
            status: "Completed (No Detection)",
          };
          console.warn("AI Service detected no known devices.");
        }
      } catch (aiError) {
        console.error(
          "Error calling AI Service (Predict):",
          aiError.response?.data || aiError.message
        );
        aiResult.error = `AI prediction failed: ${aiError.message}`;
        aiResult.status = "Failed";
      }
    } else {
      console.warn("AI_SERVICE_URL not configured. Skipping AI prediction.");
    }

    // --- Cloudinary Upload ---
    console.log("Uploading device image to Cloudinary...");
    const cloudinaryResult = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      "donated_devices"
    );
    console.log("Cloudinary Upload Successful:", cloudinaryResult.secure_url);

    // --- Database Save ---
    const newDonation = new Donation({
      donor: donorId,
      itemType: "device",
      deviceType,
      description,
      condition,
      imageUrl: cloudinaryResult.secure_url,
      imagePublicId: cloudinaryResult.public_id,
      status: "pending_approval", // Status after validation/upload
      aiValidationResult: aiResult,
    });
    await newDonation.save();
    await newDonation.populate("donor", "fullName email");

    res.status(201).json(newDonation);
  } catch (error) {
    console.error("Error processing device donation:", error.message);
    res.status(500).send("Server Error during donation process.");
  }
};

// @desc    Add a new medicine donation
// @route   POST /api/donations/medicine
// @access  Private (Donors)
exports.addMedicineDonation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  if (!req.file?.buffer)
    return res
      .status(400)
      .json({ errors: [{ msg: "Image file is required." }] });

  // Destructure medicine-specific fields from body
  const {
    medicineName,
    quantity,
    strength,
    aiExpiryText,
    aiExpiryValid,
    aiParsedDate,
  } = req.body;
  const donorId = req.user.id;

  // We get AI results from the frontend now, but keep aiResult structure
  let aiResult = {
    expiryTextDetected: aiExpiryText || null,
    isValidExpiry:
      aiExpiryValid === "true"
        ? true
        : aiExpiryValid === "false"
        ? false
        : null, // Convert string back to boolean/null
    parsedExpiryDate: aiParsedDate || null,
    status:
      aiExpiryText !== undefined ||
      aiExpiryValid !== undefined ||
      aiParsedDate !== undefined
        ? "From Frontend"
        : "Skipped", // Indicate source
    validatedAt: new Date(), // When backend received it
  };

  try {
    // --- NOTE: AI Expiry Check (/check-expiry) was already done on frontend ---
    // We received the results in the request body (aiExpiryText, aiExpiryValid, etc.)
    // We trust the frontend result for now, but backend could re-validate if needed.
    console.log("Received AI Expiry results from frontend:", aiResult);

    // --- Cloudinary Upload ---
    console.log("Uploading medicine image to Cloudinary...");
    const cloudinaryResult = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      "donated_medicines"
    ); // Different folder
    console.log("Cloudinary Upload Successful:", cloudinaryResult.secure_url);

    // --- Database Save ---
    const newDonation = new Donation({
      donor: donorId,
      itemType: "medicine",
      medicineName,
      quantity,
      strength, // Save medicine details
      imageUrl: cloudinaryResult.secure_url,
      imagePublicId: cloudinaryResult.public_id,
      status: "pending_approval", // Ready for admin review
      aiValidationResult: aiResult, // Store AI results from frontend
    });
    await newDonation.save();
    await newDonation.populate("donor", "fullName email");

    // --- Response ---
    res.status(201).json(newDonation);
  } catch (error) {
    console.error("Error processing medicine donation:", error.message);
    res.status(500).send("Server Error during donation process.");
  }
};

// --- Add controllers for GET, PUT (status), DELETE donations later ---
// @desc    Get donations (all for admin, user-specific otherwise)
// @route   GET /api/donations
// @access  Private (Admins see all, Donors/Receivers see relevant)
exports.getDonations = async (req, res) => {
    try {
        let query = {};
        const userRole = req.user.role;
        const userId = req.user.id;

        // Admins see everything
        if (userRole === 'admin') {
            // No specific filter needed for admin, they see all
            // Optionally add status filters from req.query if needed:
            // if (req.query.status) query.status = req.query.status;
        }
        // Donors see only their donations
        else if (userRole === 'donor') {
            query.donor = userId;
        }
        // Receivers might see donations assigned to them or approved ones?
        // Let's assume for now they see 'approved' donations ready for pickup/matching
        // (This logic might need refinement based on your matching system)
        else if (userRole === 'receiver') {
          query.receiver = userId;
             query.status = {
               $in: ["approved", "requested", "collected", "delivered"],
             }; // Example filter for receivers
            // You might need a field like 'assignedReceiver' later:
            // query.assignedReceiver = userId;
        } else {
             // Should not happen if 'protect' middleware is used correctly
             return res.status(403).json({ msg: "Unauthorized role" });
        }

        // Fetch donations based on the query, sort newest first
        // Populate donor info for context
        const donations = await Donation.find(query)
          .populate("donor", "fullName email organizationName address") // Populate relevant fields
          .populate("receiver", "fullName email organizationName")
          .sort({ createdAt: -1 });

        res.json(donations);

    } catch (error) {
        console.error("Error fetching donations:", error.message);
        res.status(500).send("Server Error");
    }
};


// @desc    Get a single donation by ID
// @route   GET /api/donations/:id
// @access  Private (Admin sees any, Donor sees own)
exports.getDonationById = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id)
                                       .populate('donor', 'fullName email organizationName')// Populate donor info
                                       .populate('receiver', 'fullName email organizationName');

        if (!donation) {
            return res.status(404).json({ msg: "Donation not found" });
        }

        // Access Control: Admin sees all, Donor sees only their own
        if (req.user.role !== 'admin' && donation.donor._id.toString() !== req.user.id) {
             // Also consider if receivers should see details of assigned donations
             return res.status(403).json({ msg: "Not authorized to view this donation" });
        }

        res.json(donation);

    } catch (error) {
        console.error("Error fetching donation by ID:", error.message);
        // Handle CastError if ID format is invalid
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Donation not found with that ID format' });
        }
        res.status(500).send("Server Error");
    }
};


// @desc    Update donation status by ID
// @route   PUT /api/donations/:id/status
// @access  Private/Admin
exports.updateDonationStatus = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body; // Expecting status in the body

    try {
        let donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({ msg: "Donation not found" });
        }

        // Update status
        donation.status = status;

        // Optionally add logic here (e.g., notify donor/receiver on status change)

        await donation.save();

        // Populate donor info for the response
        await donation.populate('donor', 'fullName email organizationName');
        await donation.populate("receiver", "fullName email organizationName");

        res.json(donation); // Return the updated donation

    } catch (error) {
        console.error("Error updating donation status:", error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Donation not found with that ID format' });
        }
        res.status(500).send("Server Error");
    }
};

// --- NEW FUNCTION: Receiver requests a donation ---
// @desc    Receiver requests an approved donation
// @route   PUT /api/donations/:id/request
// @access  Private (Receiver)
exports.requestDonation = async (req, res) => {
    try {
        // Only receivers can make requests
        if (req.user.role !== 'receiver') {
            return res.status(403).json({ msg: 'Only receivers can request donations.' });
        }

        const donation = await Donation.findById(req.params.id);
        if (!donation) {
            return res.status(404).json({ msg: "Donation not found" });
        }

        // Check if donation is available to be requested
        if (donation.status !== 'approved') {
            return res.status(400).json({ msg: `Donation is not available for request (Status: ${donation.status})` });
        }

        // Assign the receiver and update status
        donation.receiver = req.user.id;
        donation.status = 'requested';

        await donation.save();
        
        // Return updated donation, populated
        await donation.populate('donor', 'fullName email organizationName address');
        await donation.populate('receiver', 'fullName email organizationName');
        
        res.json(donation);

    } catch (error) {
        console.error("Error requesting donation:", error.message);
        res.status(500).send("Server Error");
    }
};

// @desc    Donor updates status of their donation (e.g., 'collected', 'delivered')
// @route   PUT /api/donations/:id/donor-status
// @access  Private (Donor)
exports.updateDonationStatusByDonor = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body; // Expecting { "status": "collected" } or { "status": "delivered" }
    const donorId = req.user.id;

    try {
        const donation = await Donation.findById(req.params.id);
        if (!donation) {
            return res.status(404).json({ msg: "Donation not found" });
        }

        // --- SECURITY CHECK: Is this user the donor for this item? ---
        if (donation.donor.toString() !== donorId) {
            return res.status(403).json({ msg: "Not authorized to update this donation." });
        }

        // --- UPDATED LOGIC: Allow specific transitions ---
        if (donation.status === 'requested' && status === 'collected') {
             // Donor confirms pickup/shipment
             donation.status = 'collected';
        } else if (donation.status === 'collected' && status === 'delivered') {
             // Donor confirms item was delivered
             donation.status = 'delivered';
        } else {
            // Block any other transitions (e.g., 'approved' -> 'delivered')
            return res.status(400).json({ msg: `Invalid status transition: Cannot change from '${donation.status}' to '${status}'.` });
        }
        // --- END UPDATED LOGIC ---

        await donation.save();
        
        // Return populated data
        await donation.populate('donor', 'fullName email organizationName address');
        await donation.populate('receiver', 'fullName email organizationName');

        res.json(donation);

    } catch (error) {
        console.error("Error updating status by donor:", error.message);
        res.status(500).send("Server Error");
    }
};
// @desc    Delete a donation by ID
// @route   DELETE /api/donations/:id
// @access  Private/Admin
exports.deleteDonation = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({ msg: "Donation not found" });
        }

        // --- Delete Image from Cloudinary ---
        if (donation.imagePublicId) {
            try {
                console.log(`Deleting image from Cloudinary: ${donation.imagePublicId}`);
                await cloudinary.uploader.destroy(donation.imagePublicId, { resource_type: 'image' });
                console.log("Cloudinary image deleted successfully.");
            } catch (cloudinaryError) {
                // Log the error but proceed with DB deletion
                console.error("Cloudinary image deletion failed:", cloudinaryError.message);
                // Optionally: return res.status(500).json({ msg: "Failed to delete image from cloud storage." });
            }
        } else {
             console.warn(`Donation ${donation._id} has no imagePublicId to delete.`);
        }

        // --- Delete Donation from Database ---
        // Mongoose 6+ uses deleteOne() or findByIdAndDelete()
        await Donation.findByIdAndDelete(req.params.id);

        res.json({ msg: "Donation removed successfully" });

    } catch (error) {
        console.error("Error deleting donation:", error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Donation not found with that ID format' });
        }
        res.status(500).send("Server Error");
    }
};


// @desc    Search for approved donations near the receiver
// @route   GET /api/donations/search
// @access  Private (Receivers)
exports.searchDonations = async (req, res) => {
  try {
    const receiverId = req.user.id; // From 'protect' middleware

    // 1. Find the logged-in receiver's profile (Now 'User' is defined)
    const receiver = await User.findById(receiverId).select('address');
    if (!receiver || !receiver.address?.city) {
      return res.status(400).json({ msg: "Please update your profile address to find donations." });
    }

    const receiverCity = receiver.address.city;

    // 2. Find all donors who are in the same city (Now 'User' is defined)
    const donorsInCity = await User.find({
      role: 'donor',
      'address.city': new RegExp(`^${receiverCity}$`, 'i') // Case-insensitive city match
    }).select('_id'); // We only need their IDs

    if (!donorsInCity.length) {
      return res.json([]); // Return empty array if no donors in the city
    }

    // 3. Get an array of just the donor IDs
    const donorIds = donorsInCity.map(d => d._id);

    // 4. Find all 'approved' donations from those donors
    const donations = await Donation.find({
      donor: { $in: donorIds }, // Match any donor in the list
      status: 'approved'        // Only show approved donations
    })
    .populate('donor', 'fullName email address') // Populate donor's details (including address)
    .sort({ createdAt: -1 });

    res.json(donations);

  } catch (error) {
    console.error("Error searching donations:", error.message);
    res.status(500).send("Server Error");
  }
};