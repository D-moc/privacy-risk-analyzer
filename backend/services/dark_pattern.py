# Plain-language explanations shown alongside each detected pattern.
# Terminology loosely follows Mathur et al., "Dark Patterns at Scale"
# (CHI 2019), the widely-cited taxonomy of manipulative UX/consent design.
from services.text_matching import matches_any_group

DARK_PATTERN_DESCRIPTIONS = {
    "Forced Consent":
        "You're required to accept broad terms just to use the service — "
        "there's no way to agree to only what you actually need.",
    "Vague Data Sharing":
        "Data may be shared with vaguely-defined groups like \"partners\" "
        "or \"affiliates\" without naming who they actually are.",
    "No Opt-Out":
        "There's no way to disable data collection or tracking, even if "
        "you don't want it.",
    "Data Hoarding":
        "Your data may be kept indefinitely, with no clear point at which "
        "it gets deleted.",
    "User Profiling":
        "Your data may be combined with other sources to build a "
        "behavioral profile of you.",
    "Data Sale":
        "The policy suggests your personal data may be sold to third "
        "parties or data brokers.",
    "Extensive Tracking":
        "The site uses heavy tracking technology such as fingerprinting "
        "or cross-site tracking.",
}

# QA finding: every check here used to be a plain `k in t` substring
# search with NO negation handling — the same bug class already fixed
# in keyword_scorer.py and the trained models, just never applied here.
# Confirmed reproducibly: "We do NOT share your data with third parties
# or affiliates" — a privacy-PROTECTIVE sentence — matched "affiliates"
# and "share with third parties" verbatim, flagging "Vague Data Sharing"
# as a "critical" finding on a policy that explicitly denies doing it.
# Fixed by reusing the same negation-aware matcher as keyword_scorer.py
# instead of a third, independent implementation.
PATTERN_KEYWORD_GROUPS = {
    "Forced Consent": [
        "by continuing you agree",
        "must accept",
        "required to accept",
        "cannot use the service without agreeing",
        "agree to all terms",
    ],
    "Vague Data Sharing": [
        "share with partners",
        "share with third parties",
        "trusted partners",
        "business partners",
        "affiliates",
    ],
    "No Opt-Out": [
        "cannot opt out",
        "no opt out",
        "unable to disable",
        "required for service",
        "mandatory collection",
    ],
    "Data Hoarding": [
        "retain indefinitely",
        "retained indefinitely",
        "keep your data indefinitely",
        "store permanently",
    ],
    "User Profiling": [
        "combine information",
        "combine data from partners",
        "profile you",
        "profiling purposes",
    ],
    "Data Sale": [
        "sell your data",
        "sell personal information",
        "data brokers",
    ],
    "Extensive Tracking": [
        "tracking technologies",
        "behavioral advertising",
        "cross-site tracking",
        "personalized advertising",
    ],
}


def detect_dark_patterns(text):
    t = text.lower()

    return [
        pattern
        for pattern, keywords in PATTERN_KEYWORD_GROUPS.items()
        if matches_any_group(t, [keywords])
    ]
