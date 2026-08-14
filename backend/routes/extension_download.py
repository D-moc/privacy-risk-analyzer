# Serves the same zip Vite already serves as a static file, but through
# the backend so every real download gets logged — the website's plain
# `<a href="/privacylens-extension.zip" download>` link bypassed the
# backend entirely, so there was no way to know how many people actually
# downloaded the extension.
import os
from datetime import datetime

from fastapi import APIRouter
from fastapi.responses import FileResponse

from database import extension_downloads_collection

router = APIRouter()

ZIP_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "frontend", "public", "privacylens-extension.zip"
)


@router.get("/extension/download")
def download_extension():
    try:
        extension_downloads_collection.insert_one({"created_at": datetime.utcnow()})
    except Exception as e:
        print("Download log error:", e)

    return FileResponse(
        ZIP_PATH,
        media_type="application/zip",
        filename="privacylens-extension.zip",
    )
