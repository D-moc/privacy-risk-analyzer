# Separate from Firebase entirely — a single hardcoded operator account,
# only ever reachable on this machine (127.0.0.1). No JWT/expiry
# machinery since there's exactly one account: the login endpoint just
# hands back ADMIN_SESSION_SECRET itself as the token, and every
# /api/admin/* route checks the Authorization header matches it.
import os
import time
from collections import defaultdict
from dotenv import load_dotenv

load_dotenv()

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin")
ADMIN_SESSION_SECRET = os.getenv("ADMIN_SESSION_SECRET", "admin-dev-secret")

# QA finding: /api/admin/login had no rate limiting or lockout at all —
# a plain string comparison, brute-forceable at whatever rate the
# network allows, with the actual configured credentials in this
# project defaulting to the weak "admin"/"admin". Changing the
# credentials themselves is a config decision for the user (see the QA
# report), but the missing rate limit is a straightforward code fix:
# after MAX_ATTEMPTS failures from the same client within
# WINDOW_SECONDS, further attempts are refused regardless of whether
# the credentials given are actually correct. In-memory (not persisted
# across restarts) is intentional — this is a single-operator local
# tool, not a multi-instance deployment.
MAX_ATTEMPTS = 5
WINDOW_SECONDS = 300  # 5 minutes

_failed_attempts = defaultdict(list)  # client_key -> [timestamp, ...]


def _prune_old_attempts(client_key, now):
    _failed_attempts[client_key] = [t for t in _failed_attempts[client_key] if now - t < WINDOW_SECONDS]


def is_rate_limited(client_key):
    now = time.time()
    _prune_old_attempts(client_key, now)
    return len(_failed_attempts[client_key]) >= MAX_ATTEMPTS


def record_failed_attempt(client_key):
    _failed_attempts[client_key].append(time.time())


def check_credentials(username, password):
    return username == ADMIN_USERNAME and password == ADMIN_PASSWORD


def require_admin(request):
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return False

    token = auth_header.replace("Bearer ", "")

    return token == ADMIN_SESSION_SECRET
