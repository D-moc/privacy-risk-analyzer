from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# IMPORT ROUTES
from routes import analyze, chatbot, auth

# CREATE APP
app = FastAPI(
    title="Privacy Risk Analyzer API",
    version="1.0.0"
)

# CORS CONFIG
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ROUTES
app.include_router(analyze.router, prefix="/api", tags=["Analyze"])
app.include_router(chatbot.router, prefix="/api", tags=["Chatbot"])
app.include_router(auth.router, prefix="/api", tags=["Auth"])

# ROOT CHECK
@app.get("/")
def home():
    return {
        "message": "Privacy Analyzer Running!",
        "status": "OK"
    }

# HEALTH CHECK (useful for deployment)
@app.get("/health")
def health():
    return {"status": "healthy"}