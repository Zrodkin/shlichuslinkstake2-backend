const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");

// Signup Route
router.post("/signup", async (req, res) => {
  const { email, password, role } = req.body;

  // Content-Type check
  if (req.headers["content-type"] !== "application/json") {
    return res.status(415).json({ msg: "Content-Type must be application/json" });
  }

  // Field validation
  if (!email || !password || !role) {
    return res.status(400).json({ msg: "Please enter all fields including role." });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ msg: "Invalid email format." });
  }

  if (!["organization", "male", "female"].includes(role)) {
    return res.status(400).json({ msg: "Invalid user role." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, role });
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error during signup." });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Content-Type check
  if (req.headers["content-type"] !== "application/json") {
    return res.status(415).json({ msg: "Content-Type must be application/json" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User does not exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login." });
  }
});

module.exports = router;
