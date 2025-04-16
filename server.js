const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ Configure CORS for Vercel and local dev
app.use(cors({
  origin: [
    "http://localhost:3000", // for local dev
    "https://shlichuslinkstake2-frontend-1kbz48taj.vercel.app", // for Vercel prod
  ],
  credentials: true,
}));

app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/messages", require("./routes/messages"));       // ✅ Combined board + private messages
app.use("/api/listings", require("./routes/listings"));
app.use("/api/applications", require("./routes/applications")); // ✅ Applications route

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
