# Wires the two trained models (built + manually approved via the admin
# Model Lab, /admin/model-lab) into the live pipeline as a cross-check on
# Groq, not a replacement for it — reduces reliance on Groq alone without
# ever showing the user two competing scores.
#
# - Model B (severity, trained on ToS;DR) only runs against Groq-sourced
#   findings (source == "ai"). Never runs against ToS;DR-sourced findings
#   — those are already human-reviewed ground truth, so cross-checking
#   them would be circular. Agreement marks a finding "verified"; on
#   disagreement, the stricter (higher-risk) severity wins, matching the
#   app's existing philosophy of erring toward flagging real concerns
#   (see dark_pattern.py's findings, always "critical").
# - Model A (practice categories, trained on OPP-115) OR-combines with
#   keyword_scorer.py's existing boolean protections checks — either
#   method catching a protection is enough to mark it present, since
#   Model A's job is to catch phrasing the keyword rules miss, not to
#   override a real keyword hit. Model A alone only detects TOPIC, not
#   whether the protection is actually granted (see the note above
#   _granted_categories for a real bug this caused and how it's fixed).
#
# Fails open: if an artifact hasn't been trained yet (fresh clone with no
# ml/artifacts/*.joblib), cross-checking is silently skipped rather than
# breaking the live /api/analyze pipeline.
import os

import joblib

from ml.text_preprocessing import negate_scope  # noqa: F401 -- referenced by the pickled vectorizer's preprocessor

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "..", "ml", "artifacts")
PRACTICE_MODEL_PATH = os.path.join(ARTIFACTS_DIR, "practice_model.joblib")
SEVERITY_MODEL_PATH = os.path.join(ARTIFACTS_DIR, "severity_model.joblib")

# Matches risk_engine.py's severity ordering (critical worst, good best).
SEVERITY_RANK = {"good": 0, "low": 1, "moderate": 2, "severe": 3, "critical": 4}

# Maps keyword_scorer.py's PROTECTIONS labels onto the OPP-115 practice
# category Model A actually predicts.
PROTECTION_TO_CATEGORY = {
    "You can request your data be deleted": "User Access, Edit and Deletion",
    "You can opt out of tracking or ad targeting": "User Choice/Control",
    "They describe real security measures": "Data Security",
}

PRESENCE_THRESHOLD = 0.5
CHUNK_WORDS = 80

_practice_model = None
_severity_model = None
_loaded = False


def _load_models():
    global _practice_model, _severity_model, _loaded
    if _loaded:
        return
    _loaded = True
    if os.path.exists(PRACTICE_MODEL_PATH):
        _practice_model = joblib.load(PRACTICE_MODEL_PATH)
    if os.path.exists(SEVERITY_MODEL_PATH):
        _severity_model = joblib.load(SEVERITY_MODEL_PATH)


# QA finding: this was escalation-only (`if model_rank > original_rank`)
# with no way to ever correct DOWNWARD, even on a clear polarity
# contradiction. Confirmed reproducibly: Groq mislabeled "We never sell
# or share your personal information with third parties" — a plainly
# protective statement — as "severe". Model B scored it 92.7% "good",
# `verified` correctly flipped to False, but the severity stayed
# "severe" forever, inflating the risk score for language that should
# reduce it. GOOD_OVERRIDE_MARGIN below only corrects that specific
# class of bug (a confident, clear good-vs-concerning contradiction on a
# finding Groq already called severe/critical) — ordinary magnitude
# disagreements (e.g. moderate vs severe) still only escalate, preserving
# the original "err toward flagging real concerns" philosophy for those.
GOOD_OVERRIDE_MARGIN = 0.15


def cross_check_findings(findings):
    _load_models()
    if not _severity_model:
        return findings

    vectorizer = _severity_model["vectorizer"]
    classifier = _severity_model["classifier"]
    severity_classes = list(classifier.classes_)

    for finding in findings:
        text = f"{finding.get('label', '')} {finding.get('detail', '')}".strip()
        if not text:
            continue

        vec = vectorizer.transform([text])
        probs = classifier.predict_proba(vec)[0]
        by_class = dict(zip(severity_classes, probs))
        model_severity = classifier.predict(vec)[0]

        original_severity = finding.get("severity", "low")
        original_rank = SEVERITY_RANK.get(original_severity, 1)
        model_rank = SEVERITY_RANK.get(model_severity, 1)

        finding["verified"] = bool(model_severity == original_severity)

        if model_rank > original_rank:
            finding["severity"] = model_severity
        elif original_severity in ("severe", "critical"):
            good_margin = by_class.get("good", 0) - (by_class.get("severe", 0) + by_class.get("critical", 0))
            if good_margin >= GOOD_OVERRIDE_MARGIN:
                finding["severity"] = "good"

    return findings


def _chunk_text(text, chunk_words=CHUNK_WORDS):
    words = text.split()
    return [" ".join(words[i:i + chunk_words]) for i in range(0, len(words), chunk_words)] or [text]


def get_category_probabilities(text):
    """Model A's max probability per OPP-115 category across the text's
    chunks — pure topic detection, no severity/polarity involved. Public
    so other deterministic checks (see services/disclosure_checks.py)
    can reuse it without duplicating the load/chunk/predict plumbing."""
    _load_models()
    if not text or not _practice_model:
        return {}

    vectorizer = _practice_model["vectorizer"]
    classifier = _practice_model["classifier"]
    labels = _practice_model["label_binarizer"].classes_

    chunks = _chunk_text(text)
    probs = classifier.predict_proba(vectorizer.transform(chunks))
    max_probs = probs.max(axis=0)

    return {label: float(p) for label, p in zip(labels, max_probs)}


def get_per_chunk_category_probabilities(text):
    """Same model, but keeps each chunk's probabilities separate instead
    of collapsing to a per-category max across the whole document. Real
    bug this exists for: taking independent per-category maxes let a
    homepage "pass" a privacy check by combining category A's max from
    one paragraph with category B's max from a totally different,
    unrelated paragraph — neither paragraph was actually privacy-dense
    on its own, but the aggregated view looked like it was. Checking
    coherence per chunk (see policy_gate.py) catches that."""
    _load_models()
    if not text or not _practice_model:
        return []

    vectorizer = _practice_model["vectorizer"]
    classifier = _practice_model["classifier"]
    labels = _practice_model["label_binarizer"].classes_

    chunks = _chunk_text(text)
    probs = classifier.predict_proba(vectorizer.transform(chunks))

    return [{label: float(p) for label, p in zip(labels, chunk_probs)} for chunk_probs in probs]


# Model A predicts TOPIC ("is this clause about user choice/control"),
# not polarity — a clause saying "we do NOT let you opt out" scores just
# as high on "User Choice/Control" as one saying "you CAN opt out",
# since OPP-115's categories only label subject matter. Confirmed by
# direct testing: "We do not provide any way to opt out" alone scored
# 87% on "User Choice/Control" from Model A. Fixed by requiring BOTH
# signals to agree on the SAME chunk: Model A says the chunk is on-topic
# AND Model B (severity) rates that same chunk "good"/"low", not
# "severe"/"critical" — a topic match on a badly-rated chunk means the
# policy denies the protection, not grants it.
#
# Second real bug found in testing: taking Model B's argmax (`.predict()`)
# treated a near-coin-flip the same as a confident call. A denied
# opt-out clause ("we do not provide any way to opt out...") scored
# good=35.5% vs severe=35.0% — "good" barely edged out "severe" by half
# a percentage point, but the argmax alone still counted it as "granted".
# Fixed by requiring a real margin between the benign bucket (good+low)
# and the concerning bucket (severe+critical) via `predict_proba`,
# rather than trusting whichever single class happens to be highest.
GRANTED_MARGIN = 0.15


def _granted_categories(text):
    if not text or not _practice_model or not _severity_model:
        return set()

    practice_vec = _practice_model["vectorizer"]
    practice_clf = _practice_model["classifier"]
    labels = _practice_model["label_binarizer"].classes_

    severity_vec = _severity_model["vectorizer"]
    severity_clf = _severity_model["classifier"]
    severity_classes = list(severity_clf.classes_)

    chunks = _chunk_text(text)
    practice_probs = practice_clf.predict_proba(practice_vec.transform(chunks))
    severity_probs = severity_clf.predict_proba(severity_vec.transform(chunks))

    granted = set()
    for chunk_practice_probs, chunk_severity_probs in zip(practice_probs, severity_probs):
        by_class = dict(zip(severity_classes, chunk_severity_probs))
        benign = by_class.get("good", 0) + by_class.get("low", 0)
        concerning = by_class.get("severe", 0) + by_class.get("critical", 0)

        if benign - concerning < GRANTED_MARGIN:
            continue

        for label, prob in zip(labels, chunk_practice_probs):
            if prob >= PRESENCE_THRESHOLD:
                granted.add(label)

    return granted


def strengthen_protections(protections, policy_text):
    _load_models()
    granted = _granted_categories(policy_text)
    if not granted:
        return protections

    for item in protections:
        category = PROTECTION_TO_CATEGORY.get(item["label"])
        if category and category in granted:
            item["present"] = True

    return protections
