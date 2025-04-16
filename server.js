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

// CORS Configuration
const allowedOrigins = [
  "http://localhost:3000",
  /^https:\/\/.*\.vercel\.app$/,
  "https://shlichuslinkstake2-frontend-ol96suvt5.vercel.app" // Your specific Vercel URL
];

app.use(cors({
  origin: function (origin, callback) {
    // For debugging
    console.log('Request origin:', origin);
    
    if (!origin || allowedOrigins.some(o => (typeof o === 'string' ? o === origin : o.test(origin)))) {
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

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Import routes
const authRoutes = require("./routes/auth");
const listingRoutes = require("./routes/listings");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});