const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
require("dotenv").config();

const app = express();

// -------------------- MIDDLEWARE --------------------
app.use(express.json());
app.use(cors());

// -------------------- MONGODB --------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// -------------------- USER SCHEMA --------------------
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  college: { type: String },
  role: { type: String },
  skills: [String],
  bio: { type: String },
  github: { type: String },
  mode: { type: String, default: "Chill" },
  isOnboarded: { type: Boolean, default: false }, // <--- This defaults to FALSE
  swipedRight: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const User = mongoose.model("User", userSchema);

// -------------------- AUTH MIDDLEWARE --------------------
// -------------------- AUTH MIDDLEWARE (DEBUG VERSION) --------------------
// -------------------- AUTH MIDDLEWARE (DEBUG VERSION) --------------------
const verifyToken = (req, res, next) => {
  console.log(`\n🛡️ [Middleware] Request: ${req.method} ${req.url}`);

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log("❌ [Middleware] Blocked: Missing Authorization Header");
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  if (!token || token === "undefined" || token === "null") {
    console.log("❌ [Middleware] Blocked: Token is null/undefined string");
    return res.status(401).json({ message: "Auth failed" });
  }

  try {
    // Check if secret exists
    if (!process.env.JWT_SECRET) {
      console.error("🔥 CRITICAL ERROR: process.env.JWT_SECRET is missing!");
      throw new Error("Server misconfiguration");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("✅ [Middleware] Token Verified. User ID:", decoded.id);
    next();
  } catch (err) {
    console.log("❌ [Middleware] Verification Failed:", err.message);
    // This prints "jwt expired" or "invalid signature"
    res.status(403).json({ message: "Invalid token" });
  }
};

// -------------------- ROUTES --------------------

// 1. SIGNUP
app.post("/api/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User exists" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    console.log("✅ New User Created:", email); // Log creation
    res.status(201).json({ message: "User created" });
  } catch (error) {
    res.status(500).json({ message: "Error creating user" });
  }
});

// 2. LOGIN
// 2. LOGIN (Updated to send full profile)
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        isOnboarded: user.isOnboarded,
        // 🔥 ADDED THESE FIELDS:
        name: user.name,
        college: user.college,
        role: user.role,
        bio: user.bio,
      },
      message: "Login successful",
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});

// 3. ONBOARDING
app.post("/api/onboarding", verifyToken, async (req, res) => {
  try {
    const { name, college, role, skills, bio, github, mode } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, college, role, skills, bio, github, mode, isOnboarded: true },
      { new: true }
    );
    res.status(200).json({ message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
});
console.log("✅ Onboarding route set up");

// 4. GET USERS FEED (🔥 DEBUG FIX APPLIED HERE)
app.get("/api/users", verifyToken, async (req, res) => {
  console.log("🔍 Fetching users for dashboard...");
  try {
    const myId = req.user.id;

    // 🔥 DEBUG LOGS: Check what is actually in your database
    const totalUsers = await User.countDocuments();
    const onboardedUsers = await User.countDocuments({ isOnboarded: true });
    console.log(
      `📊 DB STATS: Total Users: ${totalUsers} | Fully Onboarded: ${onboardedUsers}`
    );
    console.log(`👤 Requesting User ID: ${myId}`);

    // 🔥 THE FIX: We commented out 'isOnboarded: true' so you can see EVERYONE
    const users = await User.find({
      _id: { $ne: myId }, // Still hide myself
      // isOnboarded: true, // <--- DISABLED THIS FILTER
    }).limit(20);

    console.log(`🚀 Sending ${users.length} users to Dashboard`);
    res.json(users);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// 5. SWIPE ACTION
app.post("/api/swipe", verifyToken, async (req, res) => {
  try {
    const { targetUserId, direction } = req.body;
    const currentUserId = req.user.id;

    if (direction === "right") {
      const currentUser = await User.findById(currentUserId);
      const targetUser = await User.findById(targetUserId);

      if (!currentUser.swipedRight.includes(targetUserId)) {
        currentUser.swipedRight.push(targetUserId);
        await currentUser.save();
      }

      if (targetUser.swipedRight.includes(currentUserId)) {
        res.json({ match: true });
        return;
      }
    }
    res.json({ match: false });
  } catch (error) {
    res.status(500).json({ message: "Swipe failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
