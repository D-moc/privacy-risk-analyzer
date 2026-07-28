from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(
    os.getenv("MONGODB_URI")
)

db = client[
    os.getenv("DATABASE_NAME")
]

history_collection = db["history"]
ledger_collection = db["ledger_entries"]
scan_attempts_collection = db["scan_attempts"]
extension_downloads_collection = db["extension_downloads"]