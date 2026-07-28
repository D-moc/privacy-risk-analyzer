# Model B — severity classifier, trained on ToS;DR points. Single-label:
# given a clause/point of text, predict severity. Uses the exact same
# CLASSIFICATION_TO_SEVERITY mapping already in services/tosdr_lookup.py
# as training labels, so the model's output uses identical severity
# semantics to what the rest of the app already produces — this is the
# model meant to eventually cross-check Groq's own severity judgment on
# AI-sourced findings.
#
# Each row is one independent ToS;DR point (not fragments of a shared
# document), so a plain stratified split is fine here — no cross-policy
# leakage risk like Model A's OPP-115 segments had.
import csv
import os

import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, f1_score
from sklearn.model_selection import train_test_split

from ml.stop_words import SAFE_STOP_WORDS
from ml.text_preprocessing import negate_scope

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
IN_PATH = os.path.join(DATA_DIR, "tosdr_points.csv")
OUT_PATH = os.path.join(ARTIFACTS_DIR, "severity_model.joblib")

C_CANDIDATES = [0.1, 0.3, 1.0, 3.0, 10.0]


def load_data():
    texts, labels = [], []
    with open(IN_PATH, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            texts.append(row["text"])
            labels.append(row["severity"])
    return texts, labels


def main():
    texts, labels = load_data()
    print(f"Loaded {len(texts)} labeled points")

    from collections import Counter
    print("Class distribution:", Counter(labels))

    X_train, X_temp, y_train, y_temp = train_test_split(
        texts, labels, test_size=0.3, random_state=42, stratify=labels
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=42, stratify=y_temp
    )
    print(f"Train: {len(X_train)}  Val: {len(X_val)}  Test: {len(X_test)}")

    vectorizer = TfidfVectorizer(
        max_features=8000,
        ngram_range=(1, 2),
        stop_words=list(SAFE_STOP_WORDS),
        min_df=2,
        preprocessor=negate_scope,
    )
    X_train_vec = vectorizer.fit_transform(X_train)
    X_val_vec = vectorizer.transform(X_val)
    X_test_vec = vectorizer.transform(X_test)

    best_c, best_f1 = None, -1
    print("\nRegularization sweep (macro-F1 on validation split):")
    for c in C_CANDIDATES:
        clf = LogisticRegression(C=c, max_iter=1000, class_weight="balanced")
        clf.fit(X_train_vec, y_train)
        val_f1 = f1_score(y_val, clf.predict(X_val_vec), average="macro", zero_division=0)
        print(f"  C={c}: macro-F1={val_f1:.4f}")
        if val_f1 > best_f1:
            best_c, best_f1 = c, val_f1

    print(f"Best C: {best_c} (val macro-F1 {best_f1:.4f})")

    from scipy.sparse import vstack
    X_trainval_vec = vstack([X_train_vec, X_val_vec])
    y_trainval = list(y_train) + list(y_val)

    classifier = LogisticRegression(C=best_c, max_iter=1000, class_weight="balanced")
    classifier.fit(X_trainval_vec, y_trainval)

    y_pred = classifier.predict(X_test_vec)

    print("\n=== Held-out test set report (real precision/recall/F1, not training accuracy) ===")
    print(classification_report(y_test, y_pred, zero_division=0))

    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    joblib.dump({"vectorizer": vectorizer, "classifier": classifier}, OUT_PATH)
    print(f"Saved model artifact to {OUT_PATH}")


if __name__ == "__main__":
    main()
