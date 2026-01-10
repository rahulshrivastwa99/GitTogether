const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function findHackathons() {
  try {
    // 1. Use the specific stable Flash model for speed & cost
    // 2. FORCE JSON output via configuration (No regex needed!)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      generationConfig: { responseMimeType: "application/json" }
    });

    const currentDate = new Date().toISOString().split('T')[0];

    const prompt = `
      You are a specialized event data API. 
      Today's date is: ${currentDate}.
      
      Task: Find 6 major real or highly probable upcoming tech hackathons in India for 2026.
      
      Requirements:
      1. Dates must be in the future relative to ${currentDate}.
      2. IDs must be strings (e.g., "hack_01").
      3. Status must be one of: "Live", "Upcoming", "Open".
      4. Return a strictly valid JSON array.

      Schema:
      [
        {
          "id": "string",
          "title": "string",
          "host": "string",
          "location": "string",
          "prize": "string",
          "dates": "string (e.g. 'Jan 10-12, 2026')",
          "startDate": "YYYY-MM-DD",
          "endDate": "YYYY-MM-DD",
          "status": "string",
          "link": "string (valid URL)",
          "description": "string (short summary)"
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    
    // Parse the JSON directly
    const hackathons = JSON.parse(result.response.text());

    // 🔥 SANITIZATION STEP (Prevents Frontend Crashes)
    // This ensures 'id' is ALWAYS a string, fixing your substring error.
    const cleanHackathons = hackathons.map(hack => ({
      ...hack,
      id: String(hack.id || `hack_${Math.random().toString(36).substr(2, 9)}`), // Fallback ID
      status: hack.status || "Upcoming"
    }));

    return cleanHackathons;

  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    // Return empty array instead of crashing app
    return []; 
  }
}

module.exports = { findHackathons };