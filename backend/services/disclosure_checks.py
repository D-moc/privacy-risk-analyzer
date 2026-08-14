# Deterministic replacement for the 6-item disclosure-gap checklist that
# used to live inside clause_classifier.py's Groq prompt. That checklist
# asked Groq to judge the SAME 6 questions on every single policy, which
# is why AI-sourced findings looked repetitive across very different
# sites — the question never changed per policy, so the answer often
# didn't either. Moving the decision here (same architectural tier as
# keyword_scorer.py / dark_pattern.py: deterministic, no AI) means each
# check now genuinely varies with what the policy actually says.
#
# Only 3 of the 6 original checks have a real matching OPP-115 practice
# category Model A was trained on (retention, international transfer,
# access/deletion rights) — those use the model. The other 2 remaining
# (who to contact, why they collect data) have no OPP-115 category at
# all, so they stay keyword-based, same reliability class as
# keyword_scorer.py's existing protections check — not a regression,
# just not yet model-backed.
#
# The original 6th check ("file a complaint with a regulator") was
# DROPPED entirely. Found via real scan data: it fired on 65% of scans,
# and the "contact" check fired on 84% — both far too high to be
# genuine. Root causes were different for each: "contact" was a
# phrasing-too-narrow bug (fixed below with a broader net + an email
# regex). "Complaint" was a design flaw, not a phrasing bug — it checked
# for GDPR-specific terms ("supervisory authority", "regulator"), which
# assumes every scanned site is EU-regulated. Most real scanned sites
# (zepto.com, blinkit.com, jionews.com, ...) have zero legal obligation
# to mention an EU-style complaint mechanism, so the check was flagging
# globally-compliant companies for not using EU-specific language they
# were never required to use. Not fixable by better phrasing — the
# question itself doesn't apply universally, so it's gone rather than
# softened.
import re

from services.ml_cross_check import get_category_probabilities
from services.text_matching import matches_any_group

EMAIL_PATTERN = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")

# Confident the topic never comes up at all across any chunk. Deliberately
# low — this is pure topic detection (no severity/polarity needed, unlike
# ml_cross_check.py's "granted" check), so a low bar for "the model never
# even leaned this way" is the right threshold for genuine absence.
ABSENCE_THRESHOLD = 0.3

# Real bug found in testing: Groq's own free-form findings sometimes
# correctly catch a topic (e.g. "May send data internationally") that
# the whole-document chunk check still misses — dense paragraphs
# covering many topics at once dilute any single category's per-chunk
# probability (confirmed: a 90-word paragraph packing 5 disclosures
# together scored "International and Specific Audiences" at 0.16 for
# the whole chunk, vs 0.54 for that one sentence in isolation). Rather
# than showing users a visible contradiction ("May send data
# internationally" next to "Doesn't say if your data leaves the
# country"), Groq's own findings get a say too: if Groq already produced
# a finding about the same topic, that's real evidence it isn't missing.
#
# First attempt ran Model A on Groq's finding text directly — didn't
# work. Model A was trained on ~60-word OPP-115 segments; Groq's labels
# are deliberately terse (max 10 words per its prompt), badly out of
# distribution for the model ("May send data internationally" alone
# scored under 40% on every category, including the right one). Fixed
# with simple keyword matching instead — the same reliable technique
# already used for the 3 checks with no model backing at all.
GROQ_OVERRIDE_PHRASES = {
    "International and Specific Audiences": [
        "international", "other countries", "another country", "abroad", "cross-border", "outside your country",
    ],
    "Data Retention": [
        "retain", "retention", "keep your data", "keep it for", "keeps your data", "store your data for",
    ],
    "User Access, Edit and Deletion": [
        "delete", "deletion", "erase", "right to access", "correct your data",
    ],
}

DISCLOSURE_CHECKS = [
    {
        "id": "contact",
        "label": "Doesn't say who to contact about privacy",
        # Any real email address anywhere is strong, jurisdiction-agnostic
        # evidence of a contact method — checked separately from the
        # phrase list below (see detect_disclosure_gaps).
        "method": "keyword_or_email",
        "phrases": [
            [
                "contact us", "privacy officer", "data protection officer", "privacy@", "dpo@",
                "reach out to us", "reach us", "get in touch", "email us", "customer service",
                "questions or concerns", "contact our", "support team",
            ],
        ],
    },
    {
        "id": "purpose",
        "label": "Doesn't clearly explain why they need your data",
        "method": "keyword",
        "phrases": [
            [
                "for the purpose of", "in order to provide", "we use this information to", "why we collect",
                "used to provide", "necessary to provide", "so that we can", "to help us provide",
                "used for the following purposes", "purposes described", "following purposes",
                "use your personal information for", "use your information to", "process your data to",
            ],
        ],
    },
    {
        "id": "international",
        "label": "Doesn't say if your data leaves the country",
        "method": "model",
        "category": "International and Specific Audiences",
    },
    {
        "id": "retention",
        "label": "Doesn't say how long they keep your data",
        "method": "model",
        "category": "Data Retention",
    },
    {
        "id": "deletion",
        "label": "Doesn't mention your right to delete your data",
        "method": "model",
        "category": "User Access, Edit and Deletion",
    },
]


def _categories_covered_by_groq(groq_findings):
    covered = set()
    for finding in groq_findings or []:
        text_lower = f"{finding.get('label', '')} {finding.get('detail', '')}".strip().lower()
        if not text_lower:
            continue
        for category, phrases in GROQ_OVERRIDE_PHRASES.items():
            if any(phrase in text_lower for phrase in phrases):
                covered.add(category)
    return covered


def detect_disclosure_gaps(text, groq_findings=None):
    if not text:
        return []

    text_lower = text.lower()
    category_probs = get_category_probabilities(text)
    groq_covered = _categories_covered_by_groq(groq_findings)

    findings = []
    for check in DISCLOSURE_CHECKS:
        if check["method"] == "keyword_or_email":
            covered = matches_any_group(text_lower, check["phrases"]) or bool(EMAIL_PATTERN.search(text))
        elif check["method"] == "keyword":
            covered = matches_any_group(text_lower, check["phrases"])
        else:
            # Fails open: if Model A isn't trained yet, skip this
            # specific check rather than guessing either way.
            if not category_probs:
                continue
            covered = (
                category_probs.get(check["category"], 0) >= ABSENCE_THRESHOLD
                or check["category"] in groq_covered
            )

        if not covered:
            findings.append({
                "label": check["label"],
                "category": "Transparency",
                "severity": "severe",
                "origin": "detector",
                "detail": "",
            })

    return findings
