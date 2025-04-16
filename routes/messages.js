const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const auth = require("../middleware/auth"); // Import the centralized auth middleware

// 🔵 1. GET all message board messages
router.get("/board", async (req, res) => {
  try {
    const messages = await Message.find({ text: { $exists: true } })
      .populate("postedBy", "email")
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔵 2. POST message board message (text)
router.post("/board", auth, async (req, res) => {
  try {
    const message = new Message({
      text: req.body.text,
      postedBy: req.user.id,
    });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟢 3. GET personal messages sent to logged-in user + unread count
router.get("/", auth, async (req, res) => {
  try {
    const messages = await Message.find({ to: req.user.id })
      .populate("from", "email")
      .populate("listing", "jobTitle")
      .sort({ createdAt: -1 });

    const unreadCount = messages.filter((m) => !m.read).length;

    res.json({ messages, unreadCount });
  } catch (err) {
    console.error("❌ Failed to fetch messages:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 🟢 4. POST private message
router.post("/", auth, async (req, res) => {
  try {
    const { to, listing, content } = req.body;

    const message = new Message({
      from: req.user.id,
      to,
      listing,
      content,
    });

    await message.save();
    res.status(201).json({ msg: "Message sent successfully" });
  } catch (err) {
    console.error("❌ Failed to send message:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ 5. PATCH to mark message as read
router.patch("/:id/read", auth, async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, to: req.user.id },
      { read: true },
      { new: true }
    );
    if (!message) return res.status(404).json({ error: "Message not found or unauthorized." });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 6. DELETE a message
router.delete("/:id", auth, async (req, res) => {
  try {
    const message = await Message.findOneAndDelete({
      _id: req.params.id,
      to: req.user.id,
    });
    if (!message) return res.status(404).json({ error: "Message not found or unauthorized." });
    res.json({ msg: "Message deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;