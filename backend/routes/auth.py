from fastapi import APIRouter, HTTPException
from utils.firebase_admin import verify_firebase_token

router = APIRouter(prefix="/auth")


@router.post("/firebase")
async def firebase_login(data: dict):

    firebase_token = data.get("token")

    if not firebase_token:
        raise HTTPException(
            status_code=400,
            detail="Firebase token missing"
        )

    decoded = verify_firebase_token(firebase_token)

    if not decoded:
        raise HTTPException(
            status_code=401,
            detail="Invalid Firebase token"
        )

    return {
        "email": decoded.get("email"),
        "name": decoded.get("name"),
        "uid": decoded.get("uid"),
        "picture": decoded.get("picture")
    }