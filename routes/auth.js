const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");

// Signup Route
router.post("/signup", async (req, res) => {
  const { 
    name, 
    email, 
    password, 
    role, 
    whatsappNumber, 
    phoneNumber, 
    referenceName, 
    referencePhone 
  } = req.body;

  // Content-Type check
  if (req.headers["content-type"] !== "application/json") {
    return res.status(415).json({ msg: "Content-Type must be application/json" });
  }

  // Field validation
  if (!name || !email || !password || !role) {
    return res.status(400).json({ msg: "Please enter all required fields including name, email, password, and role." });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ msg: "Invalid email format." });
  }

  if (!["organization", "male", "female"].includes(role)) {
    return res.status(400).json({ msg: "Invalid user role." });
  }

  // Role-specific validation
  if (role === "organization" && !whatsappNumber) {
    return res.status(400).json({ msg: "WhatsApp number is required for organizations." });
  }

  if ((role === "male" || role === "female") && (!phoneNumber || !referenceName || !referencePhone)) {
    return res.status(400).json({ msg: "Phone number, reference name, and reference phone are required for volunteers." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user with role-specific fields
    const userData = { 
      name, 
      email, 
      password: hashedPassword, 
      role 
    };

    // Add role-specific fields
    if (role === "organization") {
      userData.whatsappNumber = whatsappNumber;
    } else if (role === "male" || role === "female") {
      userData.phoneNumber = phoneNumber;
      userData.referenceName = referenceName;
      userData.referencePhone = referencePhone;
    }

    const newUser = new User(userData);
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Return user data including role-specific fields
    const userData_response = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    };

    // Add role-specific fields to response
    if (role === "organization") {
      userData_response.whatsappNumber = newUser.whatsappNumber;
    }

    res.status(201).json({
      token,
      user: userData_response
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

    // Create response object with basic user info
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Add role-specific fields
    if (user.role === "organization") {
      userData.whatsappNumber = user.whatsappNumber;
    }

    res.json({
      token,
      user: userData
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login." });
  }
});

// Middleware for authentication
const authMiddleware = require("../middleware/auth");

// Get current user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    // No need to query the database again since req.user already contains the user data
    const user = req.user;
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update user profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, whatsappNumber, phoneNumber, referenceName, referencePhone } = req.body;
    
    // Find the user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Update basic fields if provided
    if (name) user.name = name;
    
    // Update role-specific fields if provided
    if (user.role === "organization" && whatsappNumber) {
      user.whatsappNumber = whatsappNumber;
    }
    
    if ((user.role === "male" || user.role === "female")) {
      if (phoneNumber) user.phoneNumber = phoneNumber;
      if (referenceName) user.referenceName = referenceName;
      if (referencePhone) user.referencePhone = referencePhone;
    }
    
    await user.save();
    
    // Return updated user without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    // Add role-specific fields
    if (user.role === "organization") {
      userResponse.whatsappNumber = user.whatsappNumber;
    }
    
    if (user.role === "male" || user.role === "female") {
      userResponse.phoneNumber = user.phoneNumber;
      userResponse.referenceName = user.referenceName;
      userResponse.referencePhone = user.referencePhone;
    }
    
    res.json(userResponse);
  } catch (err) {
    console.error("❌ Error updating profile:", err);
    res.status(500).json({ error: "Server error while updating profile" });
  }
});

module.exports = router;