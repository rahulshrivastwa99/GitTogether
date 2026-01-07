# server/ai_service/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()


class IdeaRequest(BaseModel):
    mySkills: str
    partnerSkills: str | None = None


@app.post("/generate-ideas")
async def generate_ideas(req: IdeaRequest):
    try:
        model = genai.GenerativeModel('gemini-pro')

        prompt = f"""
        Act as a Hackathon Mentor.
        User Skills: {req.mySkills}
        Partner Skills: {req.partnerSkills if req.partnerSkills else "None"}
        
        Generate 3 unique, winning hackathon project ideas based on these skills.
        Focus on: Social Impact, Innovation, and Feasibility.
        
        Return ONLY a JSON array with this structure (no markdown):
        [
            {{
                "title": "Project Name",
                "desc": "One line summary",
                "long_desc": "Detailed explanation of how it works",
                "features": ["Feature 1", "Feature 2", "Feature 3"],
                "stack": ["Tech 1", "Tech 2"],
                "difficulty": "Beginner/Intermediate/Advanced"
            }}
        ]
        """

        response = model.generate_content(prompt)
        return {"text": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run with: uvicorn main:app --reload --port 8000
