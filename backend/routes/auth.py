from fastapi import APIRouter, HTTPException
from database.db import users_collection
from models.user_model import UserSignup, UserLogin
from utils.auth_utils import hash_password, verify_password, create_token

router = APIRouter(prefix="/auth")


# SIGNUP
@router.post("/signup")
async def signup(user: UserSignup):
    existing = await users_collection.find_one({"email": user.email})

    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed = hash_password(user.password)

    await users_collection.insert_one({
        "email": user.email,
        "password": hashed
    })

    return {"msg": "User created successfully"}


# LOGIN
@router.post("/login")
async def login(user: UserLogin):
    db_user = await users_collection.find_one({"email": user.email})

    if not db_user:
        raise HTTPException(status_code=400, detail="User not found")

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_token({"user_id": str(db_user["_id"])})

    return {"token": token}