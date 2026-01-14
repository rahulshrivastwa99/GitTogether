const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Initialize Gemini with the Flash model for speed (if key is present)
let model = null;
try {
  if (process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // 🔥 CONFIG: Force JSON output mode (No regex needed!)
    model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      generationConfig: { responseMimeType: "application/json" },
    });
  } else {
    console.warn(
      "⚠️ GEMINI_API_KEY is missing. Idea Spark will use static fallback ideas."
    );
  }
} catch (e) {
  console.error("❌ Failed to initialise Gemini model. Falling back to static ideas.", e);
  model = null;
}

// 🔁 SAFE SERVER-SIDE FALLBACK (mirrors the frontend MOCK_IDEAS shape)
const FALLBACK_IDEAS = [
  {
    title: "EcoSmart Tracker",
    tagline: "AI-driven carbon footprint analysis for retail.",
    desc: "An AI-powered dashboard that tracks carbon footprint from grocery receipts automatically.",
    long_desc:
      "EcoSmart Tracker is a sustainability platform that empowers users to make greener purchasing decisions. By simply scanning a grocery receipt, the app uses OCR and extensive carbon footprint databases to calculate the environmental impact of each item.",
    features: ["Receipt OCR", "Carbon Analytics", "Gamified Goals"],
    stack: ["React", "Vision API", "Node.js"],
    difficulty: "Intermediate",
    matchScore: "98%",
  },
  {
    title: "HealthChain Records",
    tagline: "Decentralized patient data sovereignty.",
    desc: "A decentralized platform for securely sharing patient medical history between hospitals.",
    long_desc:
      "HealthChain aims to solve the interoperability crisis in healthcare. It uses a private blockchain to store hashes of medical records, ensuring patient data ownership and privacy.",
    features: ["Decentralized Identity", "IPFS Storage", "QR Access"],
    stack: ["Solidity", "Next.js", "IPFS"],
    difficulty: "Advanced",
    matchScore: "92%",
  },
  {
    title: "EduVoice Assistant",
    tagline: "Voice-first study companion for active recall.",
    desc: "A voice-activated study companion that quizzes students based on their notes.",
    long_desc:
      "EduVoice transforms static PDF notes into an interactive oral exam. Students upload their lecture notes, and the AI generates a conversational quiz.",
    features: ["PDF Parsing", "Voice AI", "Spaced Repetition"],
    stack: ["Python", "Whisper AI", "React"],
    difficulty: "Beginner",
    matchScore: "89%",
  },
];

/**
 * Generates Hackathon Ideas based on the "Idea Forge" parameters
 * @param {string[]} skills - Array of technologies (e.g. ["React", "Solidity"])
 * @param {string} theme - The target sector (e.g. "Fintech")
 * @param {number} teamSize - Number of members (1-6)
 */
const generateHackathonIdeas = async (skills, theme, teamSize) => {
  // If the model is not available, immediately serve static ideas instead of 500
  if (!model) {
    console.log("⚙️ Gemini unavailable, serving static Idea Spark fallback payload.");
    return FALLBACK_IDEAS;
  }

  try {
    // Safety check: Ensure skills is an array, or fallback to string splitting
    const skillList = Array.isArray(skills) ? skills.join(", ") : skills;
    const currentTheme = theme || "Open Innovation";
    const size = teamSize || 4;

    // 🔥 DYNAMIC PROMPT ENGINEERING
    // We adjust the AI's "Persona" based on the team size.
    let complexityInstruction = "";
    if (size <= 2) {
      complexityInstruction =
        "The team is small (1-2 people). Focus on HIGH-IMPACT, LOW-CODE, or clever API integrations. Avoid complex microservices.";
    } else {
      complexityInstruction =
        "The team is large (4+ people). Focus on COMPREHENSIVE ecosystems, multi-platform solutions, or complex architectures that utilize everyone.";
    }

    const prompt = `
      Act as a Lead Hackathon Strategist & Solutions Architect.
      
      MISSION PARAMETERS:
      1. **Team Arsenal:** ${skillList}
      2. **Target Sector:** ${currentTheme}
      3. **Squad Size:** ${size} Units
      
      INSTRUCTIONS:
      ${complexityInstruction}
      Generate 3 winning hackathon project missions that solve a specific problem in the '${currentTheme}' sector using the provided tech stack.
      
      OUTPUT SCHEMA (Strict JSON Array):
      [
        {
          "title": "Futuristic/Catchy Project Name",
          "tagline": "A punchy, cool 5-7 word pitch",
          "desc": "A short 1-sentence summary for the dashboard card",
          "long_desc": "A detailed 3-4 sentence technical breakdown of the problem and the proposed solution architecture",
          "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
          "stack": ["Tech 1", "Tech 2", "Tech 3", "Tech 4"],
          "difficulty": "Beginner/Intermediate/Advanced",
          "matchScore": "A confidence percentage based on their stack (e.g., '98%')"
        }
      ]
    `;

    const result = await model.generateContent(prompt);

    // With JSON mode, we just parse directly. No regex cleaning required.
    const ideas = JSON.parse(result.response.text());

    // Ensure we always return an array
    if (!Array.isArray(ideas)) {
      console.warn("⚠️ Gemini returned non-array payload. Falling back to static ideas.");
      return FALLBACK_IDEAS;
    }

    return ideas;
  } catch (error) {
    console.error("❌ AI Forge Error, serving static fallback ideas:", error);
    // Instead of throwing (which gives a 500), gracefully degrade
    return FALLBACK_IDEAS;
  }
};

module.exports = { generateHackathonIdeas };