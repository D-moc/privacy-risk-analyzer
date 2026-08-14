# Personal Data Exposure Ledger — a running record of which companies
# hold which category of your data, built automatically from every
# signed-in scan (extension or website, same backend path).
#
# One document per (user, company, category) — each new scan of a
# company overwrites that company's disposition per category with the
# latest known state rather than appending events, since what matters
# to a user is "who currently holds this," not a full history log.

from datetime import datetime
from database import ledger_collection

# Only these two states represent an actual data grant worth tracking —
# "not_mentioned" means the policy never established a grant to record.
TRACKED_STATUSES = {"collected", "shared"}


def record_grants(user_id, company, data_practices):
    now = datetime.utcnow()

    for item in data_practices.get("data_types", []):
        status = item.get("status")

        if status not in TRACKED_STATUSES:
            continue

        ledger_collection.update_one(
            {"user_id": user_id, "company": company, "category": item["label"]},
            {
                "$set": {"disposition": status, "last_seen": now},
                "$setOnInsert": {"first_seen": now},
                "$inc": {"scan_count": 1},
            },
            upsert=True,
        )


def get_ledger(user_id):
    entries = ledger_collection.find({"user_id": user_id})

    return [
        {
            "company": entry["company"],
            "category": entry["category"],
            "disposition": entry["disposition"],
            "first_seen": entry.get("first_seen"),
            "last_seen": entry.get("last_seen"),
            "scan_count": entry.get("scan_count", 1),
        }
        for entry in entries
    ]
