const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      select: false, // Don't send password in responses by default
    },
    role: {
      type: String,
      enum: ["donor", "receiver", "admin"],
      default: "donor",
    },

    // ---- Fields for Donors AND Receivers/Admins ----
    fullName: {
      // Used by Donors, potentially Admins
      type: String,
    },
    mobileNumber: {
      // Primarily for Donors, potentially Admins
      type: String,
    },
    organizationName: {
      // Used by Receivers
      type: String,
    },

    // --- Address Object (Common for Donor/Receiver) ---
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    // --- End Address Object ---

    // ---- Receiver Specific Fields (Keep separate if ONLY receivers have them) ----
    contactPerson: {
      name: String,
      phone: String,
    },
    registrationNumber: {
      // Optional, for NGOs
      type: String,
    },
    website: {
      // Optional
      type: String,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// --- Password Hashing Middleware ---
UserSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error); // Pass error to next middleware/handler
  }
});

// --- Password Comparison Method ---
UserSchema.methods.matchPassword = async function (enteredPassword) {
  // 'this.password' refers to the hashed password in the document
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create and export the User model
const User = mongoose.model("User", UserSchema);
module.exports = User;
