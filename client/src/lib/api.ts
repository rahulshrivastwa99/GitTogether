// client/src/lib/api.ts

// 🔥 FORCE LOCALHOST: If the env variable is missing/empty, use the hardcoded string.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// console.log("🔗 API Connected to:", API_BASE_URL); // Check your browser console for this!

export default API_BASE_URL;