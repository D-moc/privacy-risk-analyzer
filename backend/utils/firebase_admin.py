import os
import json

from firebase_admin import credentials
from firebase_admin import auth
import firebase_admin

_raw_credentials = os.getenv("FIREBASE_CREDENTIALS")

if not _raw_credentials:
    raise RuntimeError(
        "Missing FIREBASE_CREDENTIALS environment variable. "
        "Create a backend/.env file with your Firebase service account "
        "JSON on a single line as FIREBASE_CREDENTIALS=... (see setup docs)."
    )

try:
    firebase_credentials = json.loads(_raw_credentials)
except json.JSONDecodeError as e:
    raise RuntimeError(
        "FIREBASE_CREDENTIALS in backend/.env is not valid JSON. "
        "Make sure the whole service account file was pasted on one line."
    ) from e

cred = credentials.Certificate(
    firebase_credentials
)

if not firebase_admin._apps:
    firebase_admin.initialize_app(
        cred
    )

def verify_firebase_token(id_token: str):
    try:
        return auth.verify_id_token(
            id_token,
            clock_skew_seconds=60
        )
    except Exception as e:
        print(e)
        return None