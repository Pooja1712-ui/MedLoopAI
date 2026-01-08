const User = require("../models/User.model");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

// Helper function to create JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, role, fullName, organizationName } = req.body;

  try {
    // 1. Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // 2. Create new user based on role
    const userData = { email, password, role };

    if (role === "donor" && fullName) {
      userData.fullName = fullName;
    } else if (role === "receiver" && organizationName) {
      userData.organizationName = organizationName;
    } else if (role === "admin") {
      // Prevent unauthorized admin creation via API
      return res
        .status(403)
        .json({ msg: "Admin registration not allowed via API" });
    }

    user = new User(userData);

    // 3. Mongoose pre-save hook will hash password
    await user.save();

    // 4. Create token
    const token = generateToken(user._id, user.role);

    // 5. Send response
    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.fullName || user.organizationName,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // 1. Check for user
    // We explicitly select the password field, which is hidden by default
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // 2. Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // 3. Create token
    const token = generateToken(user._id, user.role);

    // 4. Send response
    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.fullName || user.organizationName,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};
