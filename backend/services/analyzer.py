def analyze_policy(text):

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

    # Data Collection
    collection_patterns = {
        "Email Address": [
            "email address",
            "email"
        ],

        "Phone Number": [
            "phone number",
            "telephone"
        ],

        "Location Data": [
            "location",
            "gps",
            "geolocation"
        ],

        "Device Information": [
            "device information",
            "device identifier",
            "device id"
        ],

        "Payment Information": [
            "payment information",
            "credit card",
            "billing information"
        ],

        "Browsing Activity": [
            "browsing activity",
            "usage data",
            "activity data"
        ]
    }

    for item, keywords in collection_patterns.items():
        if any(k in text_lower for k in keywords):
            clauses["data_collection"].append(item)

    # Data Sharing
    sharing_patterns = {
        "Advertising Partners": [
            "advertisers",
            "advertising partners"
        ],

        "Analytics Providers": [
            "analytics providers",
            "analytics partners"
        ],

        "Third Parties": [
            "third party",
            "third parties"
        ],

        "Affiliates": [
            "affiliates",
            "affiliate companies"
        ]
    }

    for item, keywords in sharing_patterns.items():
        if any(k in text_lower for k in keywords):
            clauses["data_sharing"].append(item)

    # cookies tracking
    cookie_patterns = {
        "Cookies": [
            "cookie",
            "cookies"
        ],

        "Behavioral Tracking": [
            "tracking",
            "tracking technologies",
            "behavioral advertising"
        ],

        "Device Tracking": [
            "device identifier",
            "fingerprinting"
        ]
    }

    for item, keywords in cookie_patterns.items():
        if any(k in text_lower for k in keywords):
            clauses["cookies"].append(item)

    # Retention
    retention_patterns = {
        "Data Retention": [
            "retain",
            "retention",
            "store data",
            "keep data"
        ],

        "Long-Term Storage": [
            "indefinitely",
            "permanently"
        ]
    }

    for item, keywords in retention_patterns.items():
        if any(k in text_lower for k in keywords):
            clauses["retention"].append(item)

    return clauses