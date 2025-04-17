const express = require("express");
const app = express();

// Basic middleware
app.use(express.json());

// Test endpoint
app.get("/", (req, res) => {
  res.send("Debug server is running");
});

console.log("Starting debugging server...");

// Test each route file individually
try {
    console.log("TESTING: application routes");
    const applicationRoutes = require("./routes/applications");
    app.use("/api/applications", applicationRoutes);
    console.log("✅ Application routes loaded successfully");
  } catch (error) {
    console.error("❌ ERROR in application routes:", error.message);
  }

// Uncomment one at a time to test
/*
try {
  console.log("TESTING: listing routes");
  const listingRoutes = require("./routes/listings");
  app.use("/api/listings", listingRoutes);
  console.log("✅ Listing routes loaded successfully");
} catch (error) {
  console.error("❌ ERROR in listing routes:", error.message);
}

try {
  console.log("TESTING: message routes");
  const messageRoutes = require("./routes/messages");
  app.use("/api/messages", messageRoutes);
  console.log("✅ Message routes loaded successfully");
} catch (error) {
  console.error("❌ ERROR in message routes:", error.message);
}

try {
  console.log("TESTING: application routes");
  const applicationRoutes = require("./routes/applications");
  app.use("/api/applications", applicationRoutes);
  console.log("✅ Application routes loaded successfully");
} catch (error) {
  console.error("❌ ERROR in application routes:", error.message);
}
*/

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Debug server running on port ${PORT}`);
});