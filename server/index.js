const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();
const { generateHackathonIdeas } = require("./services/aiService");

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
  isOnboarded: { type: Boolean, default: false },

  // 🔥 FIX: Added avatarGradient field
  avatarGradient: { type: String },

  swipedRight: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const User = mongoose.model("User", userSchema);

// -------------------- AUTH MIDDLEWARE --------------------
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
    res.status(403).json({ message: "Invalid token" });
  }
};

// -------------------- ROUTES --------------------

// 1. SIGNUP
app.post("/api/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User exists" });

    const hashedPassword = await bcrypt.hash(password, 12);

    // 🔥 FIX: Added default name and random gradient
    const newUser = new User({
      email,
      password: hashedPassword,
      name: name || "User",
      avatarGradient: `linear-gradient(135deg, #${Math.floor(
        Math.random() * 16777215
      ).toString(16)} 0%, #${Math.floor(Math.random() * 16777215).toString(
        16
      )} 100%)`,
    });

    await newUser.save();
    console.log("✅ New User Created:", email);
    res.status(201).json({ message: "User created" });
  } catch (error) {
    res.status(500).json({ message: "Error creating user" });
  }
});

// 2. LOGIN
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
        name: user.name,
        college: user.college,
        role: user.role,
        bio: user.bio,
        // 🔥 FIX: Return avatarGradient
        avatarGradient: user.avatarGradient,
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

// 4. GET USERS FEED
app.get("/api/users", verifyToken, async (req, res) => {
  console.log("🔍 Fetching users for dashboard...");
  try {
    const myId = req.user.id;
    const currentUser = await User.findById(myId);

    const totalUsers = await User.countDocuments();
    console.log(`📊 DB STATS: Total Users: ${totalUsers}`);

    // 🔥 FIX: Exclude users I have ALREADY swiped right on
    const users = await User.find({
      _id: { $ne: myId, $nin: currentUser.swipedRight },
      // isOnboarded: true, // Uncomment for production
    }).limit(20);

    console.log(`🚀 Sending ${users.length} users to Dashboard`);
    res.json(users);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// 5. SWIPE ACTION (🔥 FIXED MATCH LOGIC)
app.post("/api/swipe", verifyToken, async (req, res) => {
  try {
    const { targetUserId, direction } = req.body;
    const currentUserId = req.user.id;

    if (direction === "left") return res.json({ match: false });

    if (direction === "right") {
      const currentUser = await User.findById(currentUserId);
      const targetUser = await User.findById(targetUserId);

      // 1. Record the Swipe
      if (!currentUser.swipedRight.includes(targetUserId)) {
        currentUser.swipedRight.push(targetUserId);
        await currentUser.save();
      }

      // 2. Check for Match
      if (targetUser.swipedRight.includes(currentUserId)) {
        // 🔥 FIX: Update BOTH users' matches array
        if (!currentUser.matches.includes(targetUserId)) {
          currentUser.matches.push(targetUserId);
          await currentUser.save();
        }
        if (!targetUser.matches.includes(currentUserId)) {
          targetUser.matches.push(currentUserId);
          await targetUser.save();
        }

        res.json({ match: true });
        return;
      }
    }
    res.json({ match: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Swipe failed" });
  }
});
// 6. IDEA SPARK (AI) - Now connects directly to Gemini
// 6. IDEA SPARK (AI) - Now uses aiService.js
app.post("/api/idea-spark", async (req, res) => {
  try {
    const { mySkills, partnerSkills } = req.body;

    // Call the dedicated service function
    console.log(`🤖 Generating ideas for: ${mySkills} + ${partnerSkills}`);
    const ideas = await generateHackathonIdeas(mySkills, partnerSkills);

    res.status(200).json({ ideas });
  } catch (error) {
    console.error("Controller Error:", error.message);
    res
      .status(500)
      .json({ message: "AI generation failed, please try again." });
  }
});

// 7. GET MY MATCHES
app.get("/api/matches", verifyToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).populate(
      "matches",
      "name college role bio skills avatarGradient"
    );

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(currentUser.matches);
  } catch (error) {
    console.error("Fetch Matches Error:", error);
    res.status(500).json({ message: "Failed to fetch matches" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
