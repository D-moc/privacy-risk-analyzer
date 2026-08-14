from fastapi import APIRouter, Request
from pydantic import BaseModel

from utils.admin_auth import (
    check_credentials,
    ADMIN_SESSION_SECRET,
    is_rate_limited,
    record_failed_attempt,
)

router = APIRouter()


class AdminLoginRequest(BaseModel):
    username: str
    password: str


@router.post("/admin/login")
def admin_login(body: AdminLoginRequest, request: Request):
    client_key = request.client.host if request.client else "unknown"

    if is_rate_limited(client_key):
        return {"error": "Too many failed attempts. Try again in a few minutes."}

    if not check_credentials(body.username, body.password):
        record_failed_attempt(client_key)
        return {"error": "Invalid credentials"}

    return {"token": ADMIN_SESSION_SECRET}
