const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

const generateHackathonIdeas = async (mySkills, partnerSkills) => {
  try {
    // 🔥 PROMPT ENGINEERED FOR YOUR NEW FRONTEND UI
    const prompt = `
      Act as an Expert Hackathon Mentor.
      I have a team with these skills: "${mySkills}" and "${partnerSkills}".
      Generate 3 unique, innovative, and winning hackathon project ideas that combine these technologies.
      
      For each idea, return a JSON object with these EXACT fields:
      - title: A Catchy Name
      - desc: A short 1-sentence summary (for the dashboard card)
      - long_desc: A detailed 3-4 sentence explanation of the problem and solution (for the modal)
      - features: An array of 4 key specific features
      - stack: An array of specific technologies used (e.g., "React", "Firebase", "TensorFlow")
      - difficulty: "Beginner", "Intermediate", or "Advanced"

      IMPORTANT: Return ONLY the raw JSON array. Do not wrap it in markdown code blocks (like \`\`\`json).
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up markdown formatting if Gemini adds it
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("❌ AI Service Error:", error);
    throw new Error("Failed to generate ideas from AI");
  }
};

module.exports = { generateHackathonIdeas };
