const express = require("express");
const mongoose = require("mongoose");
const pdf = require('pdf-parse');
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// 1. Import multer at the top
const multer = require("multer");
const path = require("path");
// const upload = multer({ dest: "uploads/" });
const http = require("http"); // 🔥 IMPORT HTTP
const { Server } = require("socket.io"); // 🔥 IMPORT SOCKET.IO
const axios = require("axios");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();
// const Team = require("./models/team"); // Add this near other model imports
const {
  generateHackathonIdeas,
  fetchAIGeneratedHackathons,
} = require("./services/aiService");
const { findHackathons } = require("./services/findHack"); // <-- Add this line
// const { generateHackathonIdeas } = require("./services/aiService");
const Calendar = require("./models/calendar");
const Agreement = require("./models/agreement");
const { extractSkillsFromPDF } = require('./services/geminiService');

// -------------------- GITHUB HELPERS --------------------
function slugifyRepoName(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parseGitHubUsername(githubField) {
  if (!githubField) return null;
  const raw = String(githubField).trim();
  // Accept "username" or "https://github.com/username" or "github.com/username"
  const match = raw.match(/(?:github\.com\/)?([A-Za-z0-9-]{1,39})\/?$/i);
  return match?.[1] || null;
}

// -------------------- MIDDLEWARE --------------------

const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:5173", // For local testing
  "https://git-together-one.vercel.app", // 🔥 ADD YOUR VERCEL URL HERE
  "https://gittogether-epg7.onrender.com" // 🔥 ADD YOUR VERCEL URL HERE
];

app.use(express.json());
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use((req, res, next) => {
  console.log(`📢 Incoming Request: ${req.method} ${req.url}`);
  next();
});
//---------- SOCKET.IO SETUP --------------------
const server = http.createServer(app); 
const io = new Server(server, {
  cors: {
    // ❌ OLD (Wrong): origin: "allowedOrigins", 
    // ✅ NEW (Correct): Remove the quotes to use your array variable
    origin: allowedOrigins, 
    methods: ["GET", "POST"],
    credentials: true
  },
});

app.get("/", (req, res) => {
  res.send("GitTogether Backend is running 🚀");
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
  location: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], index: "2dsphere" }, 
  },
  role: { type: String },
  skills: [String],
  bio: { type: String },
  linkedin: { type: String, default: "" },
  github: { type: String, default: "" }, 
  portfolio: { type: String, default: "" },
   resume: { type: String, default: "" },
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

// -------------------- EVENT SCHEMA --------------------
const eventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  date: { type: Date, required: true },
  type: {
    type: String,
    enum: ["Hackathon", "Meeting", "Deadline"],
    default: "Deadline",
  },
  description: { type: String },
});

const Event = mongoose.model("Event", eventSchema);

// -------------------- TEAM & AGREEMENT SCHEMA --------------------
const teamSchema = new mongoose.Schema({
  teamName: { type: String, required: true },
  hackathonName: { type: String, required: true },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now }, // Shared Member List
  // Embedded Agreement (Shared by all members)
  agreement: {
    ipRule: { type: String, default: "opensource" },
    decisionRule: { type: String, default: "majority" },
    commitmentRule: { type: String, default: "balanced" },
    status: {
      type: String,
      enum: ["Draft", "Locked", "Signed"],
      default: "Draft",
    },
    signedMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Who has signed?
    memberDetails: [
      {
        // Individual commitments
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: String,
        hours: String,
        responsibility: String,
      },
    ],
  },
});

const Team = mongoose.models.Team || mongoose.model("Team", teamSchema);

// -------------------- SOCKET.IO LOGIC --------------------
io.on("connection", (socket) => {
  console.log(`⚡ User Connected: ${socket.id}`);

  // User joins a personal room based on their User ID
  socket.on("join_room", (userId) => {
    socket.join(userId);
    console.log(`👤 User joined room: ${userId}`);
  });

  // User joins a team room
  socket.on("join_team", (teamId) => {
    socket.join(`team_${teamId}`);
    console.log(`👥 User joined team room: team_${teamId}`);
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

// GOOGLE LOGIN ROUTE
app.post("/api/google-login", async (req, res) => {
  try {
    const { email, name, avatar } = req.body;
    
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user automatically
      user = new User({
        email,
        name,
        password: "google_login_" + Date.now(), // Secure dummy password
        avatarGradient: avatar || "linear-gradient(to right, #6a11cb 0%, #2575fc 100%)",
        isOnboarded: false
      });
      await user.save();
    }

    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({ token, user, message: "Google Login successful" });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: "Auth Failed" });
  }
});

// 1. Configure how files are stored
// ADD THIS
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit to keep your DB healthy
});


app.use("/uploads", express.static("uploads"));
// 3. ONBOARDING
// 2. Update the Onboarding Route


// Add 'upload.single("resume")' as middleware to this specific route
// const pdf = require('pdf-parse');
// const { GoogleGenerativeAI } = require("@google-generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/onboarding", verifyToken, upload.single("resume"), async (req, res) => {
  try {
    // 1. Extract all fields from req.body (Matches your Onboarding.tsx fields)
    const { name, college, role, skills, bio, github, linkedin, portfolio, mode, avatarGradient } = req.body;

    const { lat, lng } = req.body; // Sent from the frontend state

    
    let resumeData = "";
    let aiSuggestedSkills = [];

    // 2. Convert PDF buffer to Base64 String if file exists
    if (req.file) {
      // --- AI EXTRACTION START ---
      try {
        const parsePdf = typeof pdf === 'function' ? pdf : pdf.default;
        const data = await pdf(req.file.buffer);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = `Analyze this resume text and return ONLY a JSON array of technical skills (languages, frameworks, tools). Text: ${data.text}`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const cleanedText = response.text().replace(/```json|```/g, "").trim();
        aiSuggestedSkills = JSON.parse(cleanedText);
        console.log("AI Suggested Skills:", aiSuggestedSkills);
      } catch (aiErr) {
        console.error("AI Skill Extraction failed, but continuing with save:", aiErr);
      }
      // --- AI EXTRACTION END ---

      // Create a "Data URL" (e.g., data:application/pdf;base64,JVBERi...)
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      resumeData = `data:${req.file.mimetype};base64,${b64}`;
    }

    // 3. Parse skills back into an array
    const parsedSkills = typeof skills === "string" ? JSON.parse(skills) : skills;

    // 4. Prepare the update object
    const updateData = {
      name,
      college,
      role,
      bio,
      github,
      linkedin,
      portfolio,
      mode,
      // Merge AI skills with user selected skills if desired, or keep as is
      skills: parsedSkills, 
      isOnboarded: true
    };

    // 🎨 Add avatarGradient if provided (premium cyberpunk/hacker theme)
    if (avatarGradient) {
      updateData.avatarGradient = avatarGradient;
    }

    // Only set location coordinates if valid lat/lng are provided
    if (lat !== undefined && lng !== undefined) {
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);
      
      // Validate that both are valid numbers and within valid coordinate ranges
      if (!isNaN(parsedLat) && !isNaN(parsedLng) && 
          parsedLat >= -90 && parsedLat <= 90 && 
          parsedLng >= -180 && parsedLng <= 180) {
        updateData.location = {
          type: "Point",
          coordinates: [parsedLng, parsedLat] // MongoDB GeoJSON format: [longitude, latitude]
        };
      }
    }

    // 5. Add resume data only if a file was actually uploaded
    if (resumeData) {
      updateData.resume = resumeData;
    }
    
    // 6. Save to MongoDB
    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Returning suggested skills so your frontend can show "AI suggested these tags"
    res.status(200).json({ 
      message: "Profile updated successfully 🚀", 
      user,
      aiSuggestedSkills 
    });

  } catch (error) {
    console.error("Onboarding Update Error:", error);
    res.status(500).json({ message: "Update failed", error: error.message });
  }
});


app.get("/api/test-ai", async (req, res) => {
  try {
    // Sample text to simulate what pdf-parse would extract
    const sampleText = "John Doe. Skills: React, Node.js, MongoDB, Python, Docker.";
    
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `Analyze this text and return ONLY a JSON array of technical skills: ${sampleText}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const cleanedText = response.text().replace(/```json|```/g, "").trim();
    console.log("AI Testing oF resume parsing Successfull...🎉");
    res.json({ 
      status: "AI is working!", 
      foundSkills: JSON.parse(cleanedText) 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get("/nearby", verifyToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    if (!currentUser.location || !currentUser.location.coordinates) {
      return res.status(400).json({ msg: "Please set your location first" });
    }

    const nearbyUsers = await User.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: currentUser.location.coordinates, // [Lng, Lat]
          },
          $maxDistance: 10000, // Distance in meters (10,000m = 10km)
        },
      },
      _id: { $ne: req.user.id }, // Don't show the user themselves
    }).limit(20);
    console.log("Nearby Users:", nearbyUsers);
    res.json(nearbyUsers);
  } catch (err) {
    console.error(err);
    console.error("Fetch error:", err);
    res.status(500).send("Server Error");
  }
});

// TEMP TEST ROUTE: Call this via browser to set your location instantly
app.get("/api/debug/set-location", verifyToken, async (req, res) => {
  try {
    const testLat = 28.6139; // Delhi Lat
    const testLng = 77.2090; // Delhi Lng
    
    await User.findByIdAndUpdate(req.user.id, {
      location: {
        type: "Point",
        coordinates: [testLng, testLat]
      }
    });
    // console.log("Working good the testing");
    res.send("Location set to Delhi! Now try /api/users/nearby");
    
  } catch (err) {
    res.status(500).send(err.message);
  }
});

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

// 6. IDEA SPARK (AI) - Now connects directly to Gemini
app.post("/api/idea-spark", async (req, res) => {
  try {
    // 1. Extract the new "Idea Forge" parameters from frontend
    // Note: 'skills' is now an Array ["React", "AI"], 'teamSize' is a number
    const { skills, theme, teamSize, mySkills } = req.body;

    console.log(`🤖 AI Generating Request: ${teamSize} Units | Theme: ${theme || "General"}`);
    
    // 2. Fallback logic (Safety Net)
    // If 'skills' array is missing, fall back to the old 'mySkills' string
    const techStack = (skills && skills.length > 0) ? skills : (mySkills || "General Tech");
    
    // 3. Call the UPGRADED service function
    // Pass the 3 specific parameters needed for the new prompt logic
    const ideas = await generateHackathonIdeas(techStack, theme, teamSize);
    
    console.log(`🤖 AI Generated Ideas Successfully...🎉`);
    res.status(200).json({ ideas });

  } catch (error) {
    console.error("❌ Controller Error:", error.message);
    res
      .status(500)
      .json({ message: "AI Core Unreachable. Systems offline." });
  }
});

//8...hackathon finder
app.get("/api/live-hackathons", async (req, res) => {
  try {
    console.log("📡 Initializing Hackathon Radar Scan...");

    // 1. Call the AI function
    // (This uses the 'findHackathons' function we defined earlier)
    const hackathons = await findHackathons();

    // 2. Safety Check: Ensure AI returned a valid array
    if (!Array.isArray(hackathons)) {
      console.warn("⚠️ AI returned invalid structure, serving empty array.");
      return res.status(200).json([]); // Prevent frontend crash
    }

    // 3. Success Response
    console.log(`✅ Scan Complete. Detected ${hackathons.length} live signals.`);
    res.status(200).json(hackathons);

  } catch (error) {
    console.error("❌ Radar Offline:", error.message);
    
    // 4. Clean Error Response
    // The frontend checks (!response.ok), so 500 triggers the fallback UI
    res.status(500).json({ message: "Unable to establish uplink with event servers." });
  }
});

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

// -------------------- EVENT ROUTES --------------------

// 12. GET MY EVENTS
app.get("/api/events", verifyToken, async (req, res) => {
  try {
    const events = await Event.find({ userId: req.user.id }).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

// 13. ADD NEW EVENT
app.post("/api/events", verifyToken, async (req, res) => {
  try {
    const { title, date, type, description } = req.body;
    const newEvent = new Event({
      userId: req.user.id,
      title,
      date,
      type,
      description,
    });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: "Failed to add event" });
  }
});

// 14. DELETE EVENT
app.delete("/api/events/:id", verifyToken, async (req, res) => {
  try {
    await Event.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete event" });
  }
});

// ==================== ROUTE ORGANIZATION ====================
// 1. TEAM ROUTES
// 2. AGREEMENT ROUTES
// 3. USER ROUTES
// ============================================================
// ==================== 1. TEAM ROUTES ====================

// GET MY TEAM & AGREEMENT - Auto-populate memberDetails
app.get("/api/team", verifyToken, async (req, res) => {
  try {
    const team = await Team.findOne({ members: req.user.id })
      .populate("members", "name email role")
      .populate("agreement.memberDetails.userId", "name");

    if (!team) return res.json({ found: false });

    // ✅ CRITICAL: Auto-populate memberDetails if empty
    if (
      !team.agreement.memberDetails ||
      team.agreement.memberDetails.length === 0
    ) {
      team.agreement.memberDetails = team.members.map((member) => ({
        userId: member._id,
        name: member.name,
        role: "",
        hours: "",
        responsibility: "",
      }));
    }

    console.log("📦 Team sent with populated details:", {
      teamName: team.teamName,
      memberCount: team.members.length,
      detailsCount: team.agreement.memberDetails.length,
    });

    res.json({ found: true, team });
  } catch (error) {
    console.error("Team fetch error:", error);
    res.status(500).json({ message: "Error fetching team" });
  }
});

// ==================== GITHUB ROUTES ====================
// Create a GitHub repo for a team (only after contract is fully signed)
app.post("/api/team/:teamId/github-repo", verifyToken, async (req, res) => {
  try {
    const { teamId } = req.params;
    const requesterId = req.user.id;

    const team = await Team.findOne({ _id: teamId, members: requesterId })
      .populate("members", "name email role github")
      .lean();

    if (!team) {
      return res.status(404).json({ message: "Team not found or access denied" });
    }

    if (team?.agreement?.status !== "Signed") {
      return res
        .status(400)
        .json({ message: "Repo can be created only after the contract is Signed." });
    }

    const githubToken = process.env.GITHUB_TOKEN;
    const githubOwner = process.env.GITHUB_OWNER; // e.g. "my-org" or "my-username"
    const githubOwnerType = (process.env.GITHUB_OWNER_TYPE || "org").toLowerCase(); // "org" | "user"

    if (!githubToken || !githubOwner) {
      return res.status(500).json({
        message:
          "Server GitHub integration is not configured. Set GITHUB_TOKEN and GITHUB_OWNER.",
      });
    }

    const baseName = slugifyRepoName(`${team.teamName}-${team.hackathonName}`);
    const repoName = baseName || slugifyRepoName(team.teamName) || `team-${teamId.slice(-6)}`;

    // Create repo
    const createRepoUrl =
      githubOwnerType === "user"
        ? "https://api.github.com/user/repos"
        : `https://api.github.com/orgs/${githubOwner}/repos`;

    const repoPayload = {
      name: repoName,
      private: false,
      description: `GitTogether repo for team "${team.teamName}" (${team.hackathonName})`,
      has_issues: true,
      has_projects: true,
      has_wiki: true,
      auto_init: true,
    };

    const repoRes = await axios.post(createRepoUrl, repoPayload, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "GitTogether",
      },
    });

    const repoHtmlUrl = repoRes.data?.html_url;

    // Invite collaborators (best-effort)
    const memberUsernames = (team.members || [])
      .map((m) => parseGitHubUsername(m.github))
      .filter(Boolean);

    const uniqueUsernames = Array.from(new Set(memberUsernames));

    const inviteResults = [];
    for (const username of uniqueUsernames) {
      try {
        const inviteUrl = `https://api.github.com/repos/${githubOwner}/${repoName}/collaborators/${username}`;
        await axios.put(
          inviteUrl,
          { permission: "push" },
          {
            headers: {
              Authorization: `Bearer ${githubToken}`,
              Accept: "application/vnd.github+json",
              "X-GitHub-Api-Version": "2022-11-28",
              "User-Agent": "GitTogether",
            },
          }
        );
        inviteResults.push({ username, invited: true });
      } catch (e) {
        inviteResults.push({ username, invited: false });
      }
    }

    return res.json({
      message: "Repo created successfully",
      repo: { name: repoName, url: repoHtmlUrl, owner: githubOwner },
      invites: inviteResults,
    });
  } catch (error) {
    const status = error?.response?.status;
    const ghMessage =
      error?.response?.data?.message ||
      error?.response?.data?.errors?.[0]?.message ||
      null;
    console.error("GitHub repo creation error:", status, ghMessage || error?.message);
    return res.status(500).json({
      message: ghMessage || "Failed to create GitHub repo",
    });
  }
});

// CREATE TEAM - Initialize memberDetails after population
app.post("/api/team/create", verifyToken, async (req, res) => {
  try {
    const { teamName, hackathonName, memberIds } = req.body;

    // Validation
    if (
      !teamName?.trim() ||
      !hackathonName?.trim() ||
      !Array.isArray(memberIds)
    ) {
      return res.status(400).json({ message: "Missing required team data" });
    }

    // Check if creator is already in a team
    const existingTeamForCreator = await Team.findOne({
      members: req.user.id,
    });
    if (existingTeamForCreator) {
      return res
        .status(400)
        .json({ message: "You are already in a team. Leave your current team first." });
    }

    // Check if any selected member is already in a team
    for (const memberId of memberIds) {
      const existingTeamForMember = await Team.findOne({
        members: memberId,
      });
      if (existingTeamForMember) {
        return res
          .status(400)
          .json({ message: "One or more selected members are already in a team." });
      }
    }

    // Check for existing team with same name
    const existingTeam = await Team.findOne({
      teamName: teamName.trim(),
      creator: req.user.id,
    });
    if (existingTeam) {
      return res
        .status(400)
        .json({ message: "Team with this name already exists" });
    }

    // Deduplicate members
    const allMembers = Array.from(
      new Set([req.user.id, ...memberIds.map((id) => id.toString())])
    );
    const finalMembers = allMembers.filter((id) => id !== req.user.id);

    const newTeam = new Team({
      teamName: teamName.trim(),
      hackathonName: hackathonName.trim(),
      creator: req.user.id,
      members: allMembers,
      agreement: {
        memberDetails: [], // Will be populated after save
        signedMembers: [],
        ipRule: "joint",
        decisionRule: "majority",
        commitmentRule: "",
        status: "Draft",
      },
    });

    await newTeam.save();

    // ✅ CRITICAL: Populate AND initialize memberDetails
    const populatedTeam = await Team.findById(newTeam._id)
      .populate("members", "name email role")
      .lean();

    // Add memberDetails from populated members
    populatedTeam.agreement.memberDetails = populatedTeam.members.map(
      (member) => ({
        userId: member._id,
        name: member.name,
        role: "",
        hours: "",
        responsibility: "",
      })
    );

    console.log("✅ Team created:", {
      teamName: populatedTeam.teamName,
      members: populatedTeam.members.length,
    });

    // Get creator's name
    const creator = await User.findById(req.user.id);
    const creatorName = creator?.name || "Unknown";

    // 🔔 EMIT REAL-TIME NOTIFICATION TO ALL SELECTED MEMBERS
    // Notify all members (except creator) that they've been added to a team
    allMembers.forEach((memberId) => {
      if (memberId.toString() !== req.user.id.toString()) {
        io.to(memberId.toString()).emit("team_formed", {
          teamId: populatedTeam._id,
          teamName: populatedTeam.teamName,
          hackathonName: populatedTeam.hackathonName,
          creatorName: creatorName,
        });
      }
    });

    res.status(201).json({
      message: "Team created successfully",
      team: populatedTeam,
    });
  } catch (error) {
    console.error("Team creation error:", error);
    res.status(500).json({ message: "Failed to create team" });
  }
});

// UPDATE CONTRACT - Fixed with proper population
app.put("/api/team/:teamId/contract", verifyToken, async (req, res) => {
  try {
    const { teamId } = req.params;
    const { ipRule, decisionRule, commitmentRule, memberDetails } = req.body;

    const team = await Team.findOneAndUpdate(
      { _id: teamId, members: req.user.id }, // Security: must be member
      {
        $set: {
          "agreement.ipRule": ipRule || "joint",
          "agreement.decisionRule": decisionRule || "majority",
          "agreement.commitmentRule": commitmentRule || "",
          "agreement.memberDetails": memberDetails || [],
          "agreement.status": "Draft", // Reset if editing
        },
      },
      { new: true }
    )
      .populate("members", "name email role")
      .populate("agreement.memberDetails.userId", "name");

    if (!team) {
      return res
        .status(404)
        .json({ message: "Team not found or access denied" });
    }

    // Ensure memberDetails is populated even after update
    if (
      !team.agreement.memberDetails ||
      team.agreement.memberDetails.length === 0
    ) {
      team.agreement.memberDetails = team.members.map((member) => ({
        userId: member._id,
        name: member.name,
        role: "",
        hours: "",
        responsibility: "",
      }));
    }

    // 🔔 EMIT REAL-TIME UPDATE TO TEAM ROOM
    const populatedTeam = await Team.findById(teamId)
      .populate("members", "name email role")
      .populate("agreement.memberDetails.userId", "name")
      .lean();
    
    if (populatedTeam) {
      io.to(`team_${teamId}`).emit("contract_updated", populatedTeam);
    }

    res.json(team);
  } catch (error) {
    console.error("Contract update error:", error);
    res.status(500).json({ message: "Update failed" });
  }
});

// SIGN CONTRACT - Fixed ID handling + full repopulation
app.post("/api/team/:teamId/sign", verifyToken, async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    let team = await Team.findOne({ _id: teamId, members: userId });
    if (!team) {
      return res
        .status(404)
        .json({ message: "Team not found or not a member" });
    }

    // Add user to signedMembers (with deduplication)
    const userIdStr = userId.toString();
    if (
      !team.agreement.signedMembers.some((id) => id.toString() === userIdStr)
    ) {
      team.agreement.signedMembers.push(userId);

      // Check if all signed
      if (team.agreement.signedMembers.length === team.members.length) {
        team.agreement.status = "Signed";
      }

      await team.save();
    }

    // Return fully populated team
    const updatedTeam = await Team.findById(teamId)
      .populate("members", "name email role")
      .populate("agreement.memberDetails.userId", "name")
      .lean();

    // Ensure memberDetails exists
    if (
      !updatedTeam.agreement.memberDetails ||
      updatedTeam.agreement.memberDetails.length === 0
    ) {
      updatedTeam.agreement.memberDetails = updatedTeam.members.map(
        (member) => ({
          userId: member._id,
          name: member.name,
          role: "",
          hours: "",
          responsibility: "",
        })
      );
    }

    // 🔔 EMIT REAL-TIME NOTIFICATION TO OTHER TEAM MEMBERS
    // Notify all other members that someone signed
    const signedUser = updatedTeam.members.find(
      (m) => m._id.toString() === userId.toString()
    );
    
    updatedTeam.members.forEach((member) => {
      if (member._id.toString() !== userId.toString()) {
        io.to(member._id.toString()).emit("member_signed", {
          teamId: teamId,
          signedUserId: userId,
          signedUserName: signedUser?.name || "Unknown",
          message: "Please Sign",
          allSigned: updatedTeam.agreement.status === "Signed",
        });
      }
    });

    // Also emit to team room for contract updates
    io.to(`team_${teamId}`).emit("contract_updated", updatedTeam);

    res.json({ message: "Signed successfully", team: updatedTeam });
  } catch (error) {
    console.error("Contract signing error:", error);
    res.status(500).json({ message: "Signing failed" });
  }
});

// LEAVE/DELETE TEAM - Enhanced cleanup
app.delete("/api/team/leave", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id.toString();
    const team = await Team.findOne({ members: userId });

    if (!team) {
      return res.status(404).json({ message: "No team found" });
    }

    // Remove from all arrays using consistent string comparison
    team.members = team.members.filter((id) => id.toString() !== userId);

    team.agreement.memberDetails = team.agreement.memberDetails.filter(
      (detail) => detail.userId?.toString() !== userId
    );

    team.agreement.signedMembers = team.agreement.signedMembers.filter(
      (id) => id.toString() !== userId
    );

    // Delete if empty or creator leaving
    if (team.members.length === 0 || team.creator.toString() === userId) {
      await Team.findByIdAndDelete(team._id);
      return res.json({ message: "Team deleted successfully" });
    }

    await team.save();
    res.json({ message: "You left the team successfully" });
  } catch (error) {
    console.error("Leave team error:", error);
    res.status(500).json({ message: "Failed to leave team" });
  }
});

// ==================== 2. AGREEMENT ROUTES ====================

// GET MY AGREEMENT (Legacy - consider deprecation)
app.get("/api/agreement", verifyToken, async (req, res) => {
  try {
    const agreement = await Agreement.findOne({ creatorId: req.user.id });
    res.json(agreement || null);
  } catch (error) {
    console.error("Agreement fetch error:", error);
    res.status(500).json({ message: "Failed to fetch agreement" });
  }
});

// SAVE/UPDATE AGREEMENT (Legacy - consider deprecation)
app.post("/api/agreement", verifyToken, async (req, res) => {
  try {
    const { teamName, hackathonName, members, ipRule, decisionRule, signed } =
      req.body;

    const agreement = await Agreement.findOneAndUpdate(
      { creatorId: req.user.id },
      {
        creatorId: req.user.id,
        teamName,
        hackathonName,
        members,
        ipRule,
        decisionRule,
        status: signed ? "Signed" : "Draft",
        signedAt: signed ? new Date() : null,
      },
      { new: true, upsert: true }
    );

    res.json({ message: "Agreement saved", agreement });
  } catch (error) {
    console.error("Agreement save error:", error);
    res.status(500).json({ message: "Failed to save agreement" });
  }
});

// ==================== 3. USER ROUTES ====================

// GET MY PROFILE
app.get("/api/user/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Exclude password
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Fetch failed" });
  }
});

// UPDATE PROFILE
app.put("/api/user/update", verifyToken, async (req, res) => {
  try {
    const updates = { ...req.body };

    // Security: Prevent sensitive field updates
    const allowedUpdates = {
      ...updates,
    };
    delete allowedUpdates.password;
    delete allowedUpdates.email;
    delete allowedUpdates._id;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Update failed" });
  }
});

// UNMATCH USER
app.delete("/api/matches/:partnerId", verifyToken, async (req, res) => {
  try {
    const { partnerId } = req.params;
    const myId = req.user.id;

    // Mutual unmatch - atomic operation
    const [myUpdate, partnerUpdate] = await Promise.all([
      User.findByIdAndUpdate(
        myId,
        {
          $pull: { matches: partnerId, swipedRight: partnerId },
        },
        { new: true }
      ),

      User.findByIdAndUpdate(
        partnerId,
        {
          $pull: { matches: myId, swipedRight: myId },
        },
        { new: true }
      ),
    ]);

    res.json({ message: "Unmatched successfully" });
  } catch (error) {
    console.error("Unmatch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ==================== SERVER START ====================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} with Socket.io`);
});
