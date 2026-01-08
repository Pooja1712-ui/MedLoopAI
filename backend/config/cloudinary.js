const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Optional: Force HTTPS URLs
});

console.log(
  "Cloudinary Configured:",
  cloudinary.config().cloud_name ? "OK" : "Failed - Check .env vars"
); // Basic check

module.exports = cloudinary;
