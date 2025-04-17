const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  next();
});

const allowedOrigins = [
  "http://localhost:3000",
  "https://shlichuslinkstake2-frontend-ol96suvt5.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    console.log('Request origin:', origin);
    if (!origin) return callback(null, true);
    try {
      const allowed = allowedOrigins.includes(origin) || (typeof origin === 'string' && origin.endsWith('.vercel.app'));
      if (allowed) {
        console.log('✅ CORS allowed for:', origin);
        callback(null, true);
      } else {
        console.error("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    } catch (err) {
      console.error("🔥 CORS validation error:", err.message);
      callback(new Error("CORS error"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

/* ===== TEMPORARILY DISABLED ROUTES ===== */

// const authRoutes = require("./routes/auth");
// app.use("/auth", authRoutes);

// const listingRoutes = require("./routes/listings");
// app.use("/api/listings", listingRoutes);

// const messageRoutes = require("./routes/messages");
// app.use("/api/messages", messageRoutes);

// const applicationRoutes = require("./routes/applications");
// app.use("/api/applications", applicationRoutes);

/* ======================================= */

// Health check route
app.get("/", (req, res) => {
  res.send("✅ API is running (routes temporarily disabled)");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("ERROR CAUGHT BY MIDDLEWARE:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🟢 Server running on port ${PORT}`);
});
