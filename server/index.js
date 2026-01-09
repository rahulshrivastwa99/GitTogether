const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const http = require("http"); // 🔥 IMPORT HTTP
const { Server } = require("socket.io"); // 🔥 IMPORT SOCKET.IO
const axios = require("axios");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();
const {
  generateHackathonIdeas,
  fetchAIGeneratedHackathons,
} = require("./services/aiService");
const { findHackathons } = require("./services/findHack"); // <-- Add this line
// const { generateHackathonIdeas } = require("./services/aiService");
const Calendar = require("./models/calendar");
// -------------------- MIDDLEWARE --------------------
app.use(express.json());
app.use(cors());
//---------- SOCKET.IO SETUP --------------------
const server = http.createServer(app); // Wrap App in HTTP Server
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (Frontend URL)
    methods: ["GET", "POST"],
  },
});
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
  avatarGradient: { type: String },
  swipedRight: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const User = mongoose.model("User", userSchema);

// 2. 🔥 Message Schema (For Chat History)
const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

// -------------------- SOCKET.IO LOGIC --------------------
io.on("connection", (socket) => {
  console.log(`⚡ User Connected: ${socket.id}`);

  // User joins a personal room based on their User ID
  socket.on("join_room", (userId) => {
    socket.join(userId);
    console.log(`👤 User joined room: ${userId}`);
  });

  // Handle sending messages
  socket.on("send_message", async (data) => {
    const { senderId, receiverId, content } = data;

    // 1. Save to MongoDB
    try {
      const newMessage = new Message({
        sender: senderId,
        receiver: receiverId,
        content,
      });
      await newMessage.save();

      // 2. Send to Receiver (Real-time)
      io.to(receiverId).emit("receive_message", newMessage);

      // 3. Send back to Sender (for UI update)
      io.to(senderId).emit("receive_message", newMessage);
    } catch (err) {
      console.error("Message Save Error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

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
// -------------------- MY CALENDAR ROUTES --------------------

// GET CALENDAR EVENTS
app.get("/api/calendar", verifyToken, async (req, res) => {
  try {
    const events = await Calendar.find({ userId: req.user.id }).sort({
      date: 1,
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch calendar events" });
  }
});

// ADD NOTE / EVENT
// server/index.js
// ADD TO CALENDAR
app.post("/api/calendar", verifyToken, async (req, res) => {
  try {
    const { title, date, note, host, location, prize, description, link } =
      req.body;

    const event = new Calendar({
      userId: req.user.id,
      title,
      date,
      note,
      host,
      location,
      prize,
      description,
      link,
    });

    await event.save();
    res.json({ message: "Successfully added to calendar" });
  } catch (error) {
    res.status(500).json({ message: "Failed to save event" });
  }
});

// DELETE FROM CALENDAR
app.delete("/api/calendar/:id", verifyToken, async (req, res) => {
  try {
    await Calendar.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    res.json({ message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete event" });
  }
});

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
// server/index.js - Updated Swipe Logic
app.post("/api/swipe", verifyToken, async (req, res) => {
  try {
    const { targetUserId, direction } = req.body;
    const currentUserId = req.user.id;

    if (direction === "left") return res.json({ match: false });

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser.swipedRight.includes(targetUserId)) {
      currentUser.swipedRight.push(targetUserId);
      await currentUser.save();
    }

    // Check for a mutual match
    if (targetUser.swipedRight.includes(currentUserId)) {
      if (!currentUser.matches.includes(targetUserId)) {
        currentUser.matches.push(targetUserId);
        await currentUser.save();
      }
      if (!targetUser.matches.includes(currentUserId)) {
        targetUser.matches.push(currentUserId);
        await targetUser.save();
      }

      // 🔥 EMIT REAL-TIME NOTIFICATION TO PARTNER
      // This tells User B "Hey, User A just swiped you back!"
      io.to(targetUserId).emit("match_found", {
        id: currentUser._id,
        name: currentUser.name,
        avatarGradient: currentUser.avatarGradient,
        role: currentUser.role,
        college: currentUser.college,
        bio: currentUser.bio,
        skills: currentUser.skills,
      });

      res.json({ match: true });
      return;
    }
    res.json({ match: false });
  } catch (error) {
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
//8...hackathon finder
app.get("/api/live-hackathons", async (req, res) => {
  try {
    console.log("🤖 AI is searching for live hackathons...");
    const hackathons = await findHackathons(); // This must match the imported name
    res.json(hackathons);
  } catch (error) {
    console.error("AI Route Error:", error.message);
    res.status(500).json({ message: "Failed to fetch AI hackathons" });
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

// 🔥 8. GET CHAT HISTORY (New Route)
app.get("/api/messages/:partnerId", verifyToken, async (req, res) => {
  try {
    const myId = req.user.id;
    const { partnerId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: partnerId },
        { sender: partnerId, receiver: myId },
      ],
    }).sort({ timestamp: 1 }); // Sort by time (oldest first)

    res.json(messages);
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ message: "Failed to load chat" });
  }
});

// 9. GET MY PROFILE (For Settings Page)
app.get("/api/user/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Fetch failed" });
  }
});

// 10. UPDATE PROFILE
app.put("/api/user/update", verifyToken, async (req, res) => {
  try {
    const updates = req.body;

    // Prevent updating sensitive fields like password or email directly here
    delete updates.password;
    delete updates.email;
    delete updates._id;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true } // Return the updated document
    );

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Update failed" });
  }
});

// 11. UNMATCH USER (REMOVE TEAMMATE)
app.delete("/api/matches/:id", verifyToken, async (req, res) => {
  try {
    const partnerId = req.params.id;
    const myId = req.user.id;

    // 1. Remove partner from MY lists
    await User.findByIdAndUpdate(myId, {
      $pull: { matches: partnerId, swipedRight: partnerId },
    });

    // 2. Remove ME from PARTNER'S lists (Mutual unmatch)
    await User.findByIdAndUpdate(partnerId, {
      $pull: { matches: myId, swipedRight: myId },
    });

    res.json({ message: "Unmatched successfully" });
  } catch (error) {
    console.error("Unmatch Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} with Socket.io`)
);
