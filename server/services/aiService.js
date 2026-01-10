const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Initialize Gemini with the Flash model for speed
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 🔥 CONFIG: Force JSON output mode (No regex needed!)
const model = genAI.getGenerativeModel({ 
  model: "gemini-flash-latest",
  generationConfig: { responseMimeType: "application/json" }
});

/**
 * Generates Hackathon Ideas based on the "Idea Forge" parameters
 * @param {string[]} skills - Array of technologies (e.g. ["React", "Solidity"])
 * @param {string} theme - The target sector (e.g. "Fintech")
 * @param {number} teamSize - Number of members (1-6)
 */
const generateHackathonIdeas = async (skills, theme, teamSize) => {
  try {
    // Safety check: Ensure skills is an array, or fallback to string splitting
    const skillList = Array.isArray(skills) ? skills.join(", ") : skills;
    const currentTheme = theme || "Open Innovation";
    const size = teamSize || 4;

    // 🔥 DYNAMIC PROMPT ENGINEERING
    // We adjust the AI's "Persona" based on the team size.
    let complexityInstruction = "";
    if (size <= 2) {
      complexityInstruction = "The team is small (1-2 people). Focus on HIGH-IMPACT, LOW-CODE, or clever API integrations. Avoid complex microservices.";
    } else {
      complexityInstruction = "The team is large (4+ people). Focus on COMPREHENSIVE ecosystems, multi-platform solutions, or complex architectures that utilize everyone.";
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

    return ideas;

  } catch (error) {
    console.error("❌ AI Forge Error:", error);
    // You might want to throw or return a fallback here depending on your controller logic
    throw new Error("AI Core Unreachable");
  }
};

module.exports = { generateHackathonIdeas };