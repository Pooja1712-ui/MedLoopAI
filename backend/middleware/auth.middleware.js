const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token (id is in the payload)
      // We don't want the password
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ msg: "Not authorized, user not found" });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ msg: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ msg: "Not authorized, no token" });
  }
};

// Grant access to specific roles
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ msg: "Not authorized as an admin" });
  }
};

exports.isReceiver = (req, res, next) => {
  if (req.user && (req.user.role === "receiver" || req.user.role === "admin")) {
    next();
  } else {
    res.status(403).json({ msg: "Not authorized for this action" });
  }
};
