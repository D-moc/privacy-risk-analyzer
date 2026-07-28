# Data Practices — replaces the old "score every category 0-100" design.
#
# That design was based on nothing more credible than "count keyword
# hits and turn it into a percentage," which is why it showed near-zero
# for most real policies (privacy policies rarely repeat the same phrase
# many times) and had no real research behind the *scoring* itself
# (unlike the findings list, which is grounded in ToS;DR/OPP-115/GDPR).
#
# This version instead follows the format actually proven at scale for
# communicating data practices to ordinary users:
# - Apple's App Privacy labels (developer.apple.com/app-store/app-privacy-details)
#   escalate severity in three tiers per data type: not collected ->
#   linked to you -> used to track you / shared.
# - Google Play's Data Safety section and Mozilla's *Privacy Not
#   Included project both use simple yes/no practice flags rather than
#   a numeric score.
# - CMU's "Nutrition Label for Privacy" (Kelley et al., SOUPS 2009)
#   showed a simple grid of concrete data types beats free-form text for
#   fast, accurate comprehension by ordinary users.
#
# So: each data type gets one of three plain states (not a percentage),
# and separately, a short list of yes/no "protections" a user actually
# cares about. Fully deterministic — no AI involved in this file at all.
DATA_TYPES = {
    "Contact Info": [
        ["email address", "email"],
        ["phone number", "telephone"],
        ["full name", "your name"],
        ["mailing address", "home address"],
    ],
    "Location": [
        ["precise location", "gps", "geolocation"],
        ["approximate location", "ip-based location"],
    ],
    "Financial Info": [
        ["payment information", "credit card", "billing information"],
    ],
    "Browsing & Usage Activity": [
        ["browsing activity", "usage data", "activity data"],
        ["search history"],
    ],
    "Device & Identifiers": [
        ["device identifier", "device id", "device information"],
        ["ip address"],
        ["advertising id", "idfa", "aaid", "gaid"],
    ],
    "Cookies & Tracking": [
        ["cookie", "cookies"],
        ["tracking technologies", "pixel tag", "web beacon", "fingerprinting"],
    ],
}

SHARING_SIGNALS = [
    ["third party", "third parties"],
    ["advertisers", "advertising partners"],
    ["data brokers", "sell your data", "sell personal information"],
    ["affiliates", "business partners"],
]

PROTECTIONS = {
    "You can request your data be deleted": [
        ["right to delete", "right to erasure", "delete your data", "deletion of your data", "request deletion"],
    ],
    "You can opt out of tracking or ad targeting": [
        ["opt out", "opt-out", "do not sell my personal information", "disable tracking", "decline cookies"],
    ],
    "They describe real security measures": [
        ["encrypt", "encryption", "ssl", "tls", "secure servers", "secure server"],
    ],
}


# Real bug found in testing elsewhere (ml/text_preprocessing.py's
# negate_scope, disclosure_checks.py's contact/complaint fixes): a plain
# `phrase in text` substring check can't tell "you can opt out" apart
# from "we do NOT let you opt out" — both contain "opt out" as a
# substring. Negation-aware matching now lives in services/text_matching.py
# (shared with dark_pattern.py and disclosure_checks.py, which had this
# same gap independently — see that file for the QA finding).
from services.text_matching import matches_any_group, find_positive_matches

# QA finding: `shares_with_third_parties` used to be ONE global boolean
# for the whole document, applied to EVERY data type regardless of
# whether a sharing phrase actually appeared anywhere near that specific
# data type. A policy mentioning "email address" in one paragraph and,
# entirely separately, "we share aggregate analytics with advertising
# partners" in an unrelated paragraph would mark Contact Info as
# "shared" even though contact info specifically was never described as
# shared with anyone — a real false-positive source given how common
# generic sharing boilerplate ("affiliates", "business partners") is
# across real policies. Fixed with the same proximity-window technique
# already used for negation: a sharing signal only counts for a given
# data type if it's reasonably close to an actual mention of that type.
SHARING_PROXIMITY_CHARS = 300  # roughly one paragraph


def _shared_near_mention(text_lower, groups):
    for group in groups:
        for phrase in group:
            for idx in find_positive_matches(text_lower, phrase):
                window = text_lower[max(0, idx - SHARING_PROXIMITY_CHARS): idx + len(phrase) + SHARING_PROXIMITY_CHARS]
                if matches_any_group(window, SHARING_SIGNALS):
                    return True
    return False


def compute_data_practices(text):
    if not text:
        return {
            "data_types": [{"label": label, "status": "not_mentioned"} for label in DATA_TYPES],
            "protections": [{"label": label, "present": False} for label in PROTECTIONS],
        }

    text_lower = text.lower()

    data_types = []
    for label, groups in DATA_TYPES.items():
        collected = matches_any_group(text_lower, groups)
        if not collected:
            status = "not_mentioned"
        elif _shared_near_mention(text_lower, groups):
            status = "shared"
        else:
            status = "collected"
        data_types.append({"label": label, "status": status})

    protections = [
        {"label": label, "present": matches_any_group(text_lower, groups)}
        for label, groups in PROTECTIONS.items()
    ]

    return {"data_types": data_types, "protections": protections}


# Backward-compatible numeric view for older consumers (e.g. the web
# dashboard's bar chart) that expect a 0-100 number per label.
STATUS_TO_SCORE = {"not_mentioned": 0, "collected": 55, "shared": 100}


def as_score_dict(data_practices):
    return {
        item["label"]: STATUS_TO_SCORE.get(item["status"], 0)
        for item in data_practices["data_types"]
    }
