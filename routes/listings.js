const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const authMiddleware = require("../middleware/auth");
const upload = require("../middleware/upload"); // ✅ import multer upload middleware

// GET listings created by the current organization
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const listings = await Listing.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new listing with optional image upload
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const listing = new Listing({
      ...req.body,
      createdBy: req.user.id,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : "", // ✅ attach image if uploaded
    });

    await listing.save();
    res.status(201).json(listing);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET all listings with optional volunteerGender filter
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.volunteerGender) {
      filter.volunteerGender = req.query.volunteerGender;
    }
    const listings = await Listing.find(filter).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a listing by ID (only by creator)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    if (listing.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await Listing.findByIdAndDelete(req.params.id);
    res.json({ msg: "Listing deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE a listing by ID (only by creator)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    if (listing.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updated = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
