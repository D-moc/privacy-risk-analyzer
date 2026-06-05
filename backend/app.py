from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import (
    analyze,
    chatbot,
    auth,
    compare,
    history,
    stats,
    search
)

app = FastAPI(
    title="PrivacyLens API",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API ROUTES
app.include_router(
    analyze.router,
    prefix="/api",
    tags=["Analyze"]
)

app.include_router(
    compare.router,
    prefix="/api",
    tags=["Compare"]
)

app.include_router(
    chatbot.router,
    prefix="/api",
    tags=["Chatbot"]
)

app.include_router(
    auth.router,
    prefix="/api",
    tags=["Auth"]
)

app.include_router(
    history.router,
    prefix="/api",
    tags=["History"]
)

app.include_router(
    stats.router,
    prefix="/api"
)

app.include_router(
    search.router,
    prefix="/api"
)

# ROOT
@app.get("/")
def home():
    return {
        "message": "PrivacyLens API Running",
        "status": "OK",
        "version": "2.0.0"
    }

# HEALTH CHECK
@app.get("/health")
def health():
    return {
        "status": "healthy"
    }