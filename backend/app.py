from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from dotenv import load_dotenv
import os

# ---------------- Load environment variables ----------------
load_dotenv()  # reads .env file
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not set in .env file")

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

# ---------------- FastAPI setup ----------------
app = FastAPI()

# Allow frontend (React) to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Request model ----------------
class Query(BaseModel):
    prompt: str

# ---------------- API route ----------------
@app.post("/ask")
async def ask_groq(query: Query):
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": query.prompt}]
    }
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(GROQ_API_URL, json=payload, headers=headers, timeout=20)
        response.raise_for_status()
        data = response.json()
        message = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        if not message:
            message = "No response from Groq API."
        return {"reply": message}
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"API request error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")
