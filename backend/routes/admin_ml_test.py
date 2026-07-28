# Model Lab — the manual test gate requested before any integration with
# the live /api/analyze pipeline. Loads the trained artifacts (if they
# exist) purely for on-demand inference on whatever text is pasted in —
# no retraining here, and nothing in this file touches routes/analyze.py.
import os

import joblib
from fastapi import APIRouter
from fastapi import Request
from pydantic import BaseModel

from services.clause_classifier import classify_clauses
from utils.admin_auth import require_admin

# Unused directly, but a fitted TfidfVectorizer pickles its `preprocessor`
# by reference (see ml/text_preprocessing.py) — importing it here
# guarantees the module is loadable before joblib.load() ever needs it.
import ml.text_preprocessing  # noqa: F401

router = APIRouter()

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "..", "ml", "artifacts")
PRACTICE_MODEL_PATH = os.path.join(ARTIFACTS_DIR, "practice_model.joblib")
SEVERITY_MODEL_PATH = os.path.join(ARTIFACTS_DIR, "severity_model.joblib")

_practice_model = None
_severity_model = None


def _load_practice_model():
    global _practice_model
    if _practice_model is None and os.path.exists(PRACTICE_MODEL_PATH):
        _practice_model = joblib.load(PRACTICE_MODEL_PATH)
    return _practice_model


def _load_severity_model():
    global _severity_model
    if _severity_model is None and os.path.exists(SEVERITY_MODEL_PATH):
        _severity_model = joblib.load(SEVERITY_MODEL_PATH)
    return _severity_model


class MlTestRequest(BaseModel):
    text: str


@router.post("/admin/ml-test")
def ml_test(body: MlTestRequest, request: Request):
    if not require_admin(request):
        return {"error": "Unauthorized"}

    text = body.text.strip()
    if not text:
        return {"error": "No text provided"}

    result = {"practice_predictions": None, "severity_prediction": None, "groq_findings": None}

    practice_model = _load_practice_model()
    if practice_model:
        vec = practice_model["vectorizer"].transform([text])
        probs = practice_model["classifier"].predict_proba(vec)[0]
        labels = practice_model["label_binarizer"].classes_
        result["practice_predictions"] = sorted(
            [{"category": label, "probability": round(float(p), 3)} for label, p in zip(labels, probs)],
            key=lambda x: x["probability"],
            reverse=True,
        )

    severity_model = _load_severity_model()
    if severity_model:
        vec = severity_model["vectorizer"].transform([text])
        probs = severity_model["classifier"].predict_proba(vec)[0]
        classes = severity_model["classifier"].classes_
        ranked = sorted(
            [{"severity": c, "probability": round(float(p), 3)} for c, p in zip(classes, probs)],
            key=lambda x: x["probability"],
            reverse=True,
        )
        result["severity_prediction"] = ranked

    try:
        result["groq_findings"] = classify_clauses(text).get("findings", [])
    except Exception as e:
        result["groq_findings"] = []
        result["groq_error"] = str(e)

    if not practice_model:
        result["practice_model_status"] = "not trained yet"
    if not severity_model:
        result["severity_model_status"] = "not trained yet"

    return result
