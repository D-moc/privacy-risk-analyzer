from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import (
    analyze,
    chatbot,
    auth,
    compare,
    history,
    stats,
    search,
    ledger,
    admin_auth,
    admin_dashboard,
    admin_ml_test,
    extension_download
)

app = FastAPI(
    title="PrivacyLens API",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://privacy-risk-analyzer.vercel.app",
    ],
    # The Chrome extension's origin is "chrome-extension://<random-id>" —
    # the id is generated per-install for unpacked/dev extensions, so it
    # can't be listed as a fixed origin like the ones above.
    allow_origin_regex=r"chrome-extension://.*",
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

app.include_router(
    ledger.router,
    prefix="/api",
    tags=["Ledger"]
)

app.include_router(
    admin_auth.router,
    prefix="/api",
    tags=["Admin"]
)

app.include_router(
    admin_dashboard.router,
    prefix="/api",
    tags=["Admin"]
)

app.include_router(
    admin_ml_test.router,
    prefix="/api",
    tags=["Admin"]
)

app.include_router(
    extension_download.router,
    prefix="/api",
    tags=["Extension"]
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