const User = require("../models/User.model");

const seedAdmin = async () => {
  try {
    // Check if an admin user already exists
    const adminExists = await User.findOne({ role: "admin" });

    if (adminExists) {
      console.log("Admin user already exists.");
      return;
    }

    // Get admin credentials from .env
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.log(
        "ADMIN_EMAIL or ADMIN_PASSWORD not found in .env. Skipping admin seed."
      );
      return;
    }

    // Create the new admin user
    // The password will be auto-hashed by the Mongoose pre-save hook
    const adminUser = new User({
      email: email,
      password: password,
      role: "admin",
      fullName: "Admin User", // You can make this whatever you want
    });

    await adminUser.save();
    console.log("Admin user created successfully!");
  } catch (error) {
    console.error("Error creating admin user:", error.message);
  }
};

module.exports = { seedAdmin };
