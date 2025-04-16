const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add simplified CORS
app.use(cors());

// Add static file serving
app.use('/uploads', express.static('uploads'));

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Import route files
const authRoutes = require("./routes/auth");
const listingRoutes = require("./routes/listings");
const messageRoutes = require("./routes/messages");
const applicationRoutes = require("./routes/applications");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/applications", applicationRoutes);

// Add simple error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: "Server error" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Enhanced server running on port ${PORT}`);
});