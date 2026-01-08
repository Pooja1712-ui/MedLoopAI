const mongoose = require("mongoose");

const DonationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    itemType: { type: String, enum: ["medicine", "device"], required: true },

    // --- Receiver who requested the item ---
    receiver: {
      type: mongoose.Schema.ObjectId,
      ref: "User", // Links to the User model (who must have role 'receiver')
      default: null, // No receiver assigned initially
    },
    // --- Device Specific Fields ---
    deviceType: {
      type: String,
      required: function () {
        return this.itemType === "device";
      },
    },
    description: {
      type: String,
      required: function () {
        return this.itemType === "device";
      },
      trim: true,
      maxlength: 500,
    },
    condition: {
      type: String,
      enum: ["new", "good", "fair", "needs_repair"],
      required: function () {
        return this.itemType === "device";
      },
    },

    // --- Medicine Specific Fields ---
    medicineName: {
      type: String,
      required: function () {
        return this.itemType === "medicine";
      },
      trim: true,
    },
    quantity: {
      type: String,
      required: function () {
        return this.itemType === "medicine";
      },
      trim: true,
    }, // e.g., "1 Strip", "100ml Bottle"
    strength: { type: String, trim: true }, // Optional, e.g., "500mg"

    // --- Common Fields ---
    imageUrl: { type: String, required: true }, // Cloudinary URL
    imagePublicId: { type: String, required: true }, // Cloudinary Public ID

    status: {
      type: String,
      enum: [
        "pending_approval", // Donor submitted, waiting for Admin
        "approved", // Admin approved, visible to Receivers
        "rejected", // Admin rejected
        "requested", // Receiver requested, waiting for Donor
        "collected", // Donor confirmed pickup/shipped
        "delivered", // (Future use: Receiver confirms receipt)
      ],
      default: "pending_approval", // Default after AI validation attempt
    },

    // --- AI Validation Results ---
    aiValidationResult: {
      // Common
      validatedAt: Date,
      status: String, // e.g., 'Completed', 'Skipped', 'Failed'
      error: String, // Any error message from AI service call
      // Device Specific (from /predict)
      predictedClass: String,
      confidence: Number,
      // Medicine Specific (from /check-expiry)
      expiryTextDetected: String,
      isValidExpiry: { type: Boolean, default: null }, // true, false, or null if unknown
      parsedExpiryDate: String, // Store as YYYY-MM-DD string or Date
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Donation = mongoose.model("Donation", DonationSchema);
module.exports = Donation;
