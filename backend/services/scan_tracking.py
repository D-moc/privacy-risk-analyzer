# Lightweight, best-effort logging of every /api/analyze attempt — success
# AND failure — so the admin dashboard has visibility into how often the
# tool actually fails a user, not just how it behaves when it succeeds.
# Before this, only successful scans ever got saved anywhere (history_service),
# so a NOT_A_POLICY rejection, a fetch failure, or a timeout left zero
# trace. All three of those collapse into the same NOT_A_POLICY outcome
# already (fetch_policy() returns "" on any failure, which fails the
# policy gate the same way empty text always would — see policy_gate.py),
# so one outcome value covers all three failure modes.
from datetime import datetime

from database import scan_attempts_collection

EXTENSION_ORIGIN_PREFIX = "chrome-extension://"


def detect_surface(request):
    """Which surface a scan came from — inferred from the Origin header
    the browser already sends on every cross-origin request, rather than
    requiring the extension and website to explicitly self-report (which
    would need frontend changes in multiple places for no real benefit)."""
    origin = request.headers.get("origin") or ""
    return "extension" if origin.startswith(EXTENSION_ORIGIN_PREFIX) else "website"


def log_scan_attempt(policy_name, surface, outcome):
    try:
        scan_attempts_collection.insert_one({
            "policy_name": policy_name,
            "surface": surface,
            "outcome": outcome,
            "created_at": datetime.utcnow(),
        })
    except Exception as e:
        print("Scan attempt log error:", e)
