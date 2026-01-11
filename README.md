# 🚀 GitTogether: From Solo Struggle to Dream Team

![Status](https://img.shields.io/badge/Status-Live%20Build-success)
![Tech Stack](https://img.shields.io/badge/MERN-Stack-blue)
![Google Tech](https://img.shields.io/badge/Powered%20By-Google%20Gemini-orange)
![License](https://img.shields.io/badge/License-MIT-green)

> **"Innovation dies in isolation. We ensure it thrives through collaboration."**

### 🔗 Quick Links
- **Live Demo:** [https://gittogether-epg7.onrender.com](https://gittogether-epg7.onrender.com)
- **GitHub Repository:** [rahulshrivastwa99/GitTogether](https://github.com/rahulshrivastwa99/GitTogether)
- **Video Demo:** *(Add your YouTube/Drive link here)*

---

## 🧐 The Problem
Thousands of motivated students skip hackathons simply because they lack a team.
- **Isolation:** First-time participants are intimidated.
- **Skill Mismatch:** Random teams often end up with 3 designers and 0 developers.
- **Trust Issues:** Verbal agreements are broken, leading to dropouts.

## 💡 The Solution
**GitTogether** is an AI-powered ecosystem designed to build compatible, high-performing hackathon squads. We move users from *"I want to participate"* to *"We are ready to build"* using **Smart Matching**, **AI Onboarding**, and **Digital Contracts**.

---

## ✨ Key Features

### 1. 🤖 AI-Powered Onboarding (Zero Friction)
- **Resume Parsing:** Upload a PDF resume, and **Google Gemini 1.5 Flash** instantly extracts skills (e.g., React, Python) and auto-fills the profile.
- **No Manual Entry:** Saves time and ensures verified skill tags.

### 2. 📍 Smart Squad Matching
- **Geo-Location:** Uses **GeoJSON** standards to find hackers nearby (Campus/City level).
- **Gamified Swipe:** A "Tinder-like" interface to match with teammates based on Role, Skills, and "Squad Score".

### 3. 🧠 Idea Spark (Generative AI)
- Stuck on what to build? **Gemini 1.5 Flash** analyzes the **combined tech stack** of the matched team (e.g., User A: Blockchain + User B: React) to generate winning, feasible hackathon ideas.

### 4. 📜 Live Digital Contracts
- **Socket.io Integration:** Teams digitally sign a "Team Agreement" in real-time.
- **Conflict Resolution:** Locks in IP ownership, Prize Distribution, and Work Hours before coding starts.

### 5. 💬 Real-Time Collaboration
- Instant chat rooms for matched teams using WebSockets (Socket.io).

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React.js, Vite, Tailwind CSS, Framer Motion |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (with GeoJSON for Location) |
| **Real-time** | Socket.io (WebSockets) |
| **Authentication** | Firebase Auth / Google Identity Services |
| **AI Model** | **Google Gemini 1.5 Flash** |

---

## 💎 Google Technologies Used (Mandatory)

We have integrated the following Google technologies to power core features:

1.  **Google Gemini 1.5 Flash API:**
    * *Usage:* Used for parsing PDF resumes to extract JSON skill data.
    * *Usage:* Used to generate context-aware project ideas based on team skills.
2.  **Firebase Authentication:**
    * *Usage:* Secure, one-tap "Continue with Google" login flow.
3.  **GeoJSON Standards:**
    * *Usage:* Formatting location data for precise geospatial queries in the backend.

---

## 🚀 Installation & Run Locally

Follow these steps to set up the project locally.

### Prerequisites
- Node.js installed
- MongoDB URI
- Google Gemini API Key
- Firebase Configuration

### 1. Clone the Repository
```bash
git clone [https://github.com/rahulshrivastwa99/GitTogether.git](https://github.com/rahulshrivastwa99/GitTogether.git)
cd GitTogether
```
### 2. Backend Setup
 ```bash 
cd server  # Or whatever your backend folder is named
npm install

PORT=5000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_google_gemini_key
JWT_SECRET=your_secret_key

node index.js
# Server runs on http://localhost:5000
```

### Frontend Setup
```bash
cd client  # Or whatever your frontend folder is named
npm install

VITE_FIREBASE_API_KEY=your_firebase_key
VITE_SERVER_URL=http://localhost:5000

npm run dev
# Application runs on http://localhost:8080
```

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


Made with ❤️ by Team CloudX for TechSprint Hackathon.
