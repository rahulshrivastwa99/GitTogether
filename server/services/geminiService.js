const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const extractSkillsFromPDF = async (pdfText) => {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `
    You are an expert technical recruiter. Analyze the following text from a resume 
    and return ONLY a JSON array of technical skills found. 
    Focus on: Programming languages, frameworks, databases, and tools.
    Text: ${pdfText}
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  // Clean the response to ensure it's valid JSON
  return JSON.parse(text.replace(/```json|```/g, ""));
};

module.exports = { extractSkillsFromPDF };