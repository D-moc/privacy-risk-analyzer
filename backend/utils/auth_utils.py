from passlib.context import CryptContext
from jose import jwt
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

# 🔐 Password hashing setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 🔑 Secret key
SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7


# 🔥 HASH PASSWORD (with bcrypt fix)
def hash_password(password: str):
    # bcrypt supports max 72 bytes
    password = password[:72]
    return pwd_context.hash(password)


# 🔥 VERIFY PASSWORD
def verify_password(password: str, hashed: str):
    password = password[:72]
    return pwd_context.verify(password, hashed)


# 🔥 CREATE JWT TOKEN
def create_token(data: dict):
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)