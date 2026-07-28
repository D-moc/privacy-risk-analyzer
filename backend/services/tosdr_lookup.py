# Hybrid scoring, source #1: check ToS;DR's public, human-reviewed
# database (https://tosdr.org) before falling back to our own AI
# classifier. ToS;DR volunteers manually read real terms/privacy
# documents and grade individual points — when a site is covered there,
# that's a more trustworthy signal than an AI's best guess.
import re
from urllib.parse import urlparse

import requests

SEARCH_URL = "https://api.tosdr.org/search/v5/"
SERVICE_URL = "https://api.tosdr.org/service/v3/"

# ToS;DR's own point classifications, mapped onto our severity scale.
CLASSIFICATION_TO_SEVERITY = {
    "blocker": "critical",
    "bad": "severe",
    "neutral": "low",
    "good": "good",
}

DOMAIN_PATTERN = re.compile(r"^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")


def _strip_www(host):
    return host[4:] if host.lower().startswith("www.") else host


def guess_domain(policy_name, input_data):
    for candidate in (input_data, policy_name):
        if not candidate:
            continue
        candidate = candidate.strip()
        if candidate.startswith("http"):
            host = urlparse(candidate).hostname
            if host:
                return _strip_www(host.lower())
        elif DOMAIN_PATTERN.match(candidate):
            return _strip_www(candidate.lower())
    return None


def _brand_name(domain):
    parts = domain.split(".")
    return parts[-2] if len(parts) >= 2 else domain


def _find_service(domain):
    query = _brand_name(domain)
    try:
        resp = requests.get(SEARCH_URL, params={"query": query}, timeout=5)
        if resp.status_code != 200:
            return None
        services = resp.json().get("services", [])
    except requests.RequestException:
        return None

    for service in services:
        urls = service.get("urls") or []
        for u in urls:
            u = _strip_www(u.lower())
            if domain == u or domain.endswith("." + u):
                return service

    return None


def _get_service_points(service_id):
    try:
        resp = requests.get(SERVICE_URL, params={"id": service_id}, timeout=5)
        if resp.status_code != 200:
            return None
        return resp.json()
    except requests.RequestException:
        return None


def lookup(policy_name, input_data):
    domain = guess_domain(policy_name, input_data)
    if not domain:
        return None

    service = _find_service(domain)
    if not service:
        return None

    detail = _get_service_points(service["id"])
    if not detail:
        return None

    findings = []
    for point in detail.get("points", []):
        case = point.get("case") or {}
        severity = CLASSIFICATION_TO_SEVERITY.get(case.get("classification"), "low")
        label = (point.get("title") or case.get("title") or "Untitled point").strip()

        # ToS;DR's own "title" is already a complete, self-explanatory
        # sentence (e.g. "Users have a reduced time period to take legal
        # action against the service") — their longer "description" field
        # is a full explanatory paragraph, which is exactly the kind of
        # wall of text this app is trying to avoid, so it's dropped here.
        findings.append({
            "label": label[:100],
            "category": "ToS;DR Community Review",
            "severity": severity,
            "detail": "",
        })

    if not findings:
        return None

    return {
        "service_name": detail.get("name"),
        "tosdr_rating": detail.get("rating"),
        "service_url": f"https://edit.tosdr.org/services/{service['id']}",
        "findings": findings,
    }
