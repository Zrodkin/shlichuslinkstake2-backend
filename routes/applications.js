const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const Message = require("../models/Message");
const Listing = require("../models/Listing");
const auth = require("../middleware/auth");

// POST /api/applications – Submit an application
router.post("/", auth, async (req, res) => {
  // Content-Type check
  if (req.headers["content-type"] !== "application/json") {
    return res.status(415).json({ msg: "Content-Type must be application/json" });
  }

  try {
    const { listingId } = req.body;
    const userId = req.user.id;

    if (!listingId) {
      return res.status(400).json({ error: "Listing ID is required." });
    }

    // Prevent duplicate applications
    const existing = await Application.findOne({ user: userId, listing: listingId });
    if (existing) {
      return res.status(400).json({ error: "You already applied to this listing." });
    }

    // Save application
    const application = new Application({ user: userId, listing: listingId });
    await application.save();

    // Get the listing and its creator
    const listing = await Listing.findById(listingId).populate("createdBy", "email");
    if (!listing || !listing.createdBy || !listing.createdBy._id) {
      return res.status(404).json({ error: "Listing or its creator not found." });
    }

    // Create message to notify the organization
    const message = new Message({
      to: listing.createdBy._id,
      from: userId,
      listing: listing._id,
      content: `Someone applied to your listing: "${listing.jobTitle}"`,
    });
    await message.save();

    res.status(201).json({ msg: "Application submitted and message sent." });
  } catch (err) {
    console.error("❌ Error in application submission:", err);
    res.status(500).json({ error: "Server error during application submission." });
  }
});

// GET /api/applications/received – Organization's received applications
router.get("/received", auth, async (req, res) => {
  try {
    const applications = await Application.find()
      .populate({
        path: "listing",
        match: { createdBy: req.user.id },
        select: "jobTitle location",
      })
      .populate("user", "email")
      .sort({ createdAt: -1 });

    // Filter out applications where listing is null (due to match failure)
    const filtered = applications.filter((app) => app.listing);
    res.json(filtered);
  } catch (err) {
    console.error("❌ Error fetching received applications:", err);
    res.status(500).json({ error: "Server error while fetching applications." });
  }
});

module.exports = router;
