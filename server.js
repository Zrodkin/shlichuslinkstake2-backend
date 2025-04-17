const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// === Logging middleware ===
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Origin:", req.headers.origin);
  next();
});

// === Debug header to test reachability ===
app.use((req, res, next) => {
  res.setHeader("X-CORS-Debug", "Middleware reached");
  next();
});

// === CORS configuration ===
const allowedOrigins = [
  "http://localhost:3000",
  "https://shlichuslinkstake2-frontend.vercel.app",
  "https://shlichuslinkstake2-frontend-ol96suvt5.vercel.app",
  "https://shlichuslinkstake2-frontend-1k3wmumi2.vercel.app",
  "https://shlichuslinkstake2-frontend-8hhrhynv8.vercel.app" // Added your current deployment URL
];

app.use(cors({
  origin: function (origin, callback) {
    console.log("Request origin:", origin);
    const allowed = allowedOrigins.includes(origin) || (typeof origin === "string" && origin.endsWith(".vercel.app"));
    console.log("Is allowed by explicit list:", allowedOrigins.includes(origin));
    console.log("Is allowed by .vercel.app check:", typeof origin === "string" && origin.endsWith(".vercel.app"));
    
    if (!origin || allowed) {
      console.log("✅ CORS allowed for:", origin);
      callback(null, true);
    } else {
      console.error("❌ CORS blocked for:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// === Handle all preflight OPTIONS requests ===
app.options("*", cors({
  origin: function (origin, callback) {
    const allowed = allowedOrigins.includes(origin) || (typeof origin === "string" && origin.endsWith(".vercel.app"));
    if (!origin || allowed) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// === Explicitly handle preflight OPTIONS for /auth/* ===
app.options("/auth/*", cors({
  origin: function (origin, callback) {
    const allowed = allowedOrigins.includes(origin) || (typeof origin === "string" && origin.endsWith(".vercel.app"));
    if (!origin || allowed) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// === EXPLICIT: Handle OPTIONS for /auth/login ===
app.options("/auth/login", cors({
  origin: function (origin, callback) {
    const allowed = allowedOrigins.includes(origin) || (typeof origin === "string" && origin.endsWith(".vercel.app"));
    if (!origin || allowed) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// === Express middleware ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// === MongoDB connection ===
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// === Routes ===
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

const listingRoutes = require("./routes/listings");
app.use("/api/listings", listingRoutes);

const messageRoutes = require("./routes/messages");
app.use("/api/messages", messageRoutes);

const applicationRoutes = require("./routes/applications");
app.use("/api/applications", applicationRoutes);

// === Health check ===
app.get("/", (req, res) => {
  res.send("✅ API is running");
});

// === Global error handler ===
app.use((err, req, res, next) => {
  console.error("❌ ERROR CAUGHT BY MIDDLEWARE:", err.stack || err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// === Server start ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🟢 Server running on port ${PORT}`);
});