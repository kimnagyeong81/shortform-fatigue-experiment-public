from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import certifi
from dotenv import load_dotenv
from datetime import datetime
import os

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGODB_URI = os.getenv("MONGODB_URI")

if not MONGODB_URI:
    raise ValueError("MONGODB_URI가 .env 파일에 설정되어 있지 않습니다.")

client = MongoClient(
    MONGODB_URI,
    tls=True,
    tlsCAFile=certifi.where()
)

db = client["shorts_experiment"]
events_collection = db["video_events"]
sessions_collection = db["sessions"]


@app.get("/")
def root():
    return {"message": "FastAPI MongoDB server is running"}


@app.get("/health")
def health_check():
    try:
        client.admin.command("ping")
        return {
            "status": "ok",
            "mongodb": "connected"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


@app.post("/events")
def create_event(event: dict):
    now = datetime.utcnow()

    event_doc = {
        **event,
        "created_at": now,
    }

    result = events_collection.insert_one(event_doc)

    return {
        "success": True,
        "event_id": str(result.inserted_id)
    }


@app.post("/sessions")
def create_session(session: dict):
    now = datetime.utcnow()

    session_doc = {
        **session,
        "started_at": now,
        "ended_at": None,
        "created_at": now,
    }

    result = sessions_collection.insert_one(session_doc)

    return {
        "success": True,
        "session_id": str(result.inserted_id)
    }
