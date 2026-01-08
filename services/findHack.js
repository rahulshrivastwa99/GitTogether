const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function findHackathons() {
  // Make sure this name matches what you call in index.js
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `Search for 6 major upcoming tech hackathons in India for 2026. 
  Return a valid JSON array of objects with keys: id, title, host, location, prize, dates, startDate, endDate, status, link, description. 
  Output ONLY the JSON array.`;

  const result = await model.generateContent(prompt);
  const text = result.response
    .text()
    .replace(/```json|```/g, "")
    .trim();
  return JSON.parse(text);
}

// THIS IS THE CRITICAL LINE: Ensure you export the name you use
module.exports = { findHackathons };
