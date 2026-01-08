const axios = require("axios");

async function testIdeaSparkAPI() {
  const baseURL = "http://localhost:5000";
  const endpoint = "/api/idea-spark";

  console.log("🧪 Testing Idea Spark API...");

  try {
    console.log("\n📤 Test 1: Valid request with mySkills");

    const response = await axios.post(`${baseURL}${endpoint}`, {
      mySkills: "React, Node.js, MongoDB",
      partnerSkills: "Python, AI",
    });

    console.log("✅ Status:", response.status);
    console.log("🎯 Ideas count:", response.data.ideas.length);
    console.log("📝 First idea:", response.data.ideas[0].title);
  } catch (error) {
    console.error("❌ Test failed");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testIdeaSparkAPI();
