from datetime import datetime
from database import history_collection

def save_analysis(data):

    history_collection.insert_one({
        **data,
        "created_at": datetime.utcnow()
    })

def get_history(user_id):

    reports = []

    items = history_collection.find({
    "user_id": user_id
}).sort(
    "created_at",
    -1
)

    for item in items:

        reports.append({
            "id": str(item["_id"]),

            "policy_name": item.get(
                "policy_name",
                "Unknown Policy"
            ),

            "risk_score": item.get(
                "risk_score",
                0
            ),

            "risk_level": item.get(
                "risk_level",
                "Unknown"
            ),

            "privacy_report": item.get(
                "privacy_report",
                ""
            ),

            "dark_patterns": item.get(
                "dark_patterns",
                []
            ),

            "clauses": item.get(
                "clauses",
                {}
            ),

            "insights": item.get(
                "insights",
                {}
            ),

            "created_at": item.get(
                "created_at"
            )
        })

    return reports


def get_report(report_id):

    item = history_collection.find_one({
        "_id": report_id
    })

    if not item:
        return None

    return {
        "id": str(item["_id"]),

        "policy_name": item.get(
            "policy_name",
            "Unknown Policy"
        ),

        "risk_score": item.get(
            "risk_score"
        ),

        "risk_level": item.get(
            "risk_level"
        ),

        "privacy_report": item.get(
            "privacy_report"
        ),

        "dark_patterns": item.get(
            "dark_patterns",
            []
        ),

        "clauses": item.get(
            "clauses",
            {}
        ),

        "insights": item.get(
            "insights",
            {}
        ),

        "created_at": item.get(
            "created_at"
        )
    }


def delete_report(report_id):

    result = history_collection.delete_one({
        "_id": report_id
    })

    return result.deleted_count > 0