# Pre-flight check: does this text actually look like a privacy policy
# at all? Real bug found in production: a user scanned infosys.com's
# HOMEPAGE (AI product marketing, case studies) instead of navigating to
# their actual privacy policy page — the extension just analyzes
# whatever's on screen when the icon is clicked. The tool dutifully
# flagged "doesn't mention retention/contact/international transfer" on
# all of it, which is technically true and completely useless: the
# homepage was never going to discuss any of that. The bug wasn't in the
# checks, it was analyzing the wrong page entirely.
#
# This is the tool's actual foundation — checking the privacy policy and
# how user data/security is handled, not general website content — so
# this gate runs first, before any analysis (including the paid Groq
# call), and refuses to proceed on text that doesn't look like a privacy
# policy, telling the user clearly instead of producing a wall of
# accurate-but-meaningless "doesn't mention X" findings.
#
# Iteration history, all found via real sites, not synthetic tests:
# 1. A naive "title phrase appears anywhere = auto-pass" shortcut failed
#    on Titan's homepage, whose footer links to a page literally called
#    "Wearable Privacy Policy" — a nav link, not the document.
# 2. The first density fix (distinct phrase CATEGORIES present / text
#    length) then failed on Titan's own real Cookie Policy page — a
#    long, legitimate, narrowly-scoped document was penalized for only
#    touching a handful of distinct categories relative to its length.
#    Fixed by counting total OCCURRENCES with repetition instead.
#
# Both of those rounds were hand-tuned against specific sites, which is
# exactly the failure mode to avoid going forward (a fixed English
# phrase list will always be one phrasing convention away from breaking
# on some other real site). So the keyword check below is kept as a
# fast, cheap FIRST pass that catches the common/obvious case, but a
# text that fails it now falls back to Model A (services/ml_cross_check.py,
# trained on 115 real, industry-diverse companies' policies from
# OPP-115) — a trained classifier generalizes across phrasing and
# industry far better than any hand-picked phrase list, which is the
# actual fix for "must work on any domain, not just the ones tested."
from services.ml_cross_check import get_per_chunk_category_probabilities

PRIVACY_INDICATOR_PHRASES = [
    "personal information", "personal data", "we collect", "information we collect",
    "your data", "data protection", "how we use your information", "cookies",
    "third parties", "your privacy", "data we collect", "use your information",
    "this privacy policy", "this privacy notice", "this privacy statement",
]

MIN_LENGTH = 200
MIN_OCCURRENCE_DENSITY_PER_1000_CHARS = 2.5

# Model A fallback: real bug found testing this on Titan's own homepage
# — checking each category's max probability independently across all
# chunks let two DIFFERENT, unrelated paragraphs (one scoring high on
# "Policy Change", a totally different one on "First Party Collection/
# Use") combine into a false "2+ strong categories" verdict, even though
# neither paragraph was actually privacy-dense on its own. Fixed by
# requiring one SINGLE chunk to coherently score high on multiple
# categories at once — that's what a genuinely privacy-dense paragraph
# looks like, not scattered unrelated maxes. "Other" (OPP-115's
# catch-all for content that doesn't fit any specific category) is
# excluded from the count on purpose — confidently landing in the
# catch-all bucket isn't evidence of real privacy content, if anything
# it's evidence of the opposite.
MODEL_CONFIDENCE_THRESHOLD = 0.5
MODEL_MIN_STRONG_CATEGORIES = 2
MODEL_EXCLUDED_CATEGORIES = {"Other"}


def _keyword_density_check(text_lower, length):
    total_occurrences = sum(text_lower.count(phrase) for phrase in PRIVACY_INDICATOR_PHRASES)
    density = total_occurrences / (length / 1000)
    return density >= MIN_OCCURRENCE_DENSITY_PER_1000_CHARS


def _model_check(text):
    per_chunk = get_per_chunk_category_probabilities(text)
    for chunk_probs in per_chunk:
        strong_categories = sum(
            1 for category, p in chunk_probs.items()
            if category not in MODEL_EXCLUDED_CATEGORIES and p >= MODEL_CONFIDENCE_THRESHOLD
        )
        if strong_categories >= MODEL_MIN_STRONG_CATEGORIES:
            return True
    return False


def looks_like_privacy_policy(text):
    if not text or len(text) < MIN_LENGTH:
        return False

    text_lower = text.lower()

    if _keyword_density_check(text_lower, len(text)):
        return True

    return _model_check(text)
