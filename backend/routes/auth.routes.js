const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { registerUser, loginUser } = require("../controllers/auth.controller");

// Validation rules for registration
const registerValidation = [
  check("email", "Please include a valid email").isEmail(),
  check(
    "password",
    "Please enter a password with 6 or more characters"
  ).isLength({ min: 6 }),
  check("role", "Role is required").isIn(["donor", "receiver"]),
];

// Validation rules for login
const loginValidation = [
  check("email", "Please include a valid email").isEmail(),
  check("password", "Password is required").exists(),
];

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post("/register", registerValidation, registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", loginValidation, loginUser);

module.exports = router;
