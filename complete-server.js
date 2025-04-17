const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// Create Express app
const app = express();

// Add debugging middleware 
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  next();
});

// CORS Configuration - Without regex that causes path-to-regexp errors
const allowedOrigins = [
  "http://localhost:3000",
  "https://shlichuslinkstake2-frontend-ol96suvt5.vercel.app",
  "https://shlichuslinkstake2-frontend.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // For debugging
    console.log('Request origin:', origin);
    
    if (!origin) {
      callback(null, true);
      return;
    }
    
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      // Log success
      console.log('✅ CORS allowed for:', origin);
      callback(null, true);
    } else {
      console.error("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Add explicit OPTIONS handling for preflight requests
app.options('*', cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Import routes
try {
  console.log("Loading routes...");
  const authRoutes = require("./routes/auth");
  const listingRoutes = require("./routes/listings");
  const messageRoutes = require("./routes/messages");
  const applicationRoutes = require("./routes/applications");

  // Use routes
  app.use("/auth", authRoutes); // Changed from "/api/auth" to "/auth" to match frontend
  app.use("/api/listings", listingRoutes);
  app.use("/api/messages", messageRoutes);
  app.use("/api/applications", applicationRoutes);
  
  console.log("All routes loaded successfully!");
} catch (error) {
  console.error("Error loading routes:", error.message);
  console.error(error.stack);
}

// Add root endpoint for health checks
app.get("/", (req, res) => {
  res.send("Shlichus Links API is running");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Complete server running on port ${PORT}`);
});