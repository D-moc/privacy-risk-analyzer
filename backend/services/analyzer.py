def analyze_policy(text):
    """
    Extract important clauses from privacy policy text
    """

    if not text:
        return {
            "data_collection": [],
            "data_sharing": [],
            "cookies": [],
            "retention": []
        }

    text_lower = text.lower()

    clauses = {
        "data_collection": [],
        "data_sharing": [],
        "cookies": [],
        "retention": []
    }

    # 🔍 DATA COLLECTION
    if any(word in text_lower for word in ["collect", "gather", "personal data", "information"]):
        clauses["data_collection"].append("Collects user data")

    # 🔍 DATA SHARING
    if any(word in text_lower for word in ["share", "third party", "partners", "advertisers"]):
        clauses["data_sharing"].append("Shares data with third parties")

    # 🔍 COOKIES / TRACKING
    if any(word in text_lower for word in ["cookie", "tracking", "browser data"]):
        clauses["cookies"].append("Uses cookies / tracking")

    # 🔍 DATA RETENTION
    if any(word in text_lower for word in ["retain", "store", "save data", "keep data"]):
        clauses["retention"].append("Stores user data")

    return clauses