import os
import json

from firebase_admin import credentials
from firebase_admin import auth
import firebase_admin

firebase_credentials = json.loads(
    os.environ["FIREBASE_CREDENTIALS"]
)

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