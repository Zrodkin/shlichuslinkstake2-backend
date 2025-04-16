const express = require("express");
const app = express();
const cors = require("cors");

// Basic middleware
app.use(express.json());
app.use(cors());

// Home route for testing
app.get("/", (req, res) => {
  res.send("Minimal server is running");
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Minimal server running on port ${PORT}`);
});