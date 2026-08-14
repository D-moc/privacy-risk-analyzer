# Shared negation-aware phrase matching — extracted from
# keyword_scorer.py (where this was first built and tested) so
# dark_pattern.py and disclosure_checks.py can reuse the exact same
# logic instead of each doing their own plain `phrase in text` search.
#
# QA finding this fixes: dark_pattern.py had ZERO negation handling —
# "share with third parties" matched inside "We do NOT share with third
# parties", flagging a privacy-PROTECTIVE sentence as a manipulative
# dark pattern (confirmed "critical" severity, directly inflating the
# risk score). disclosure_checks.py's own `_matches_any_group` was a
# separate, weaker duplicate with the same gap. Same bug class already
# fixed once in keyword_scorer.py and the trained models this session —
# it just hadn't been applied here. Centralizing here so it can't drift
# out of sync between files again.
import re

NEGATION_WORD_PATTERN = re.compile(r"\b(not|no|never|cannot|without|unable)\b")
NEGATION_WINDOW_CHARS = 60
SENTENCE_BOUNDARY_CHARS = (".", "!", "?", ";")


def is_negated(text_lower, match_start):
    window_start = max(0, match_start - NEGATION_WINDOW_CHARS)
    window = text_lower[window_start:match_start]

    # Don't look further back than the start of the current sentence, so
    # a negation in an earlier, unrelated sentence can't falsely cancel
    # a genuine later statement.
    last_boundary = max(window.rfind(c) for c in SENTENCE_BOUNDARY_CHARS)
    if last_boundary != -1:
        window = window[last_boundary + 1:]

    return bool(NEGATION_WORD_PATTERN.search(window)) or "n't" in window


def phrase_matches_positively(text_lower, phrase):
    start = 0
    while True:
        idx = text_lower.find(phrase, start)
        if idx == -1:
            return False
        if not is_negated(text_lower, idx):
            return True
        start = idx + len(phrase)


def matches_any_group(text_lower, groups):
    return any(any(phrase_matches_positively(text_lower, phrase) for phrase in group) for group in groups)


def find_positive_matches(text_lower, phrase):
    """Like phrase_matches_positively, but returns every non-negated
    match's start index instead of stopping at the first one — needed
    by keyword_scorer.py's proximity check (is a sharing signal near
    THIS specific match, not just anywhere in the document)."""
    matches = []
    start = 0
    while True:
        idx = text_lower.find(phrase, start)
        if idx == -1:
            return matches
        if not is_negated(text_lower, idx):
            matches.append(idx)
        start = idx + len(phrase)
