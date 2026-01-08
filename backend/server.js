const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const { seedAdmin } = require("./services/seed.service");

// Load env vars
dotenv.config();

// Connect to Database
connectDB().then(() => {
  // We run the admin seed function *after* the DB connection is successful
  seedAdmin();
});

const app = express();

// --- Middlewares ---
// Enable CORS
app.use(cors());

// Body Parser
app.use(express.json());

// --- API Routes ---
app.get("/", (req, res) => {
  res.send("MedLoopAi API Running...");
});

// Auth routes
app.use("/api/auth", require("./routes/auth.routes"));

// User profile routes 
app.use("/api/users", require("./routes/user.routes"));

// Blog routes 
app.use("/api/blogs", require("./routes/blog.routes"))

// Donations routes 
app.use("/api/donations", require("./routes/donation.routes"));

// Example of a protected admin route
// const { protect, isAdmin } = require('./middleware/auth.middleware');
// app.use("/api/admin", protect, isAdmin, require("./routes/admin.routes"));

// --- Server ---
const PORT = process.env.PORT || 5001;

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
