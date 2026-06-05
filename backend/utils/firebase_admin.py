from firebase_admin import credentials, auth
import firebase_admin

cred = credentials.Certificate("serviceAccountKey.json")

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

def verify_firebase_token(id_token: str):
    try:
        return auth.verify_id_token(
            id_token,
            clock_skew_seconds=60
        )
    except Exception as e:
        print(e)
        return None