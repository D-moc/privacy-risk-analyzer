from fastapi import APIRouter, Request
from database.db import db

router = APIRouter()

@router.post("/save")
async def save_result(request: Request):
    data = await request.json()

    await db.history.insert_one(data)

    return {"msg": "Saved"}