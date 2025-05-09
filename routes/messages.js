const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const authMiddleware = require("../middleware/auth");
const upload = require("../middleware/upload"); // Multer for image upload

// GET listings created by the current organization
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const listings = await Listing.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    console.error("❌ Error fetching organization listings:", err);
    res.status(500).json({ error: "Server error while fetching your listings." });
  }
});

// POST a new listing with optional image upload
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.is("multipart/form-data")) {
      return res.status(415).json({ msg: "Content-Type must be multipart/form-data" });
    }

    const { jobTitle, description, location, volunteerGender, startDate, endDate } = req.body;

    const listing = new Listing({
      jobTitle,
      description,
      location,
      volunteerGender,
      startDate,
      endDate,
      createdBy: req.user.id,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : "",
    });

    await listing.save();
    res.status(201).json(listing);
  } catch (err) {
    console.error("❌ Error creating listing:", err);
    res.status(400).json({ error: "Error creating listing. Please check your input." });
  }
});

// GET all listings (with optional gender filter)
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.volunteerGender) {
      filter.volunteerGender = req.query.volunteerGender;
    }

    const listings = await Listing.find(filter).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    console.error("❌ Error fetching listings:", err);
    res.status(500).json({ error: "Server error while fetching listings." });
  }
});

// DELETE a listing by ID (only by creator)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    if (listing.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized to delete this listing" });
    }

    await Listing.findByIdAndDelete(req.params.id);
    res.json({ msg: "Listing deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting listing:", err);
    res.status(500).json({ error: "Server error while deleting listing." });
  }
});

// UPDATE a listing by ID (only by creator)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    if (listing.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized to update this listing" });
    }

    const allowedFields = ["jobTitle", "description", "location", "volunteerGender", "startDate", "endDate"];
    const updates = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const updated = await Listing.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating listing:", err);
    res.status(500).json({ error: "Server error while updating listing." });
  }
});

module.exports = router;
