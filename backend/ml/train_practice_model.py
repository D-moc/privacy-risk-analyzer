# Model A — practice-presence classifier, trained on OPP-115.
# Multi-label: given a paragraph, predict which of OPP-115's 10 practice
# categories it addresses. Cross-checks two existing approximations in
# the live app: keyword_scorer.py's substring-search PROTECTIONS dict,
# and clause_classifier.py's hardcoded 6-point Groq prompt.
#
# TF-IDF + OneVsRestClassifier(LogisticRegression) — classical, CPU-only.
# LogisticRegression (not LinearSVC) specifically so predict_proba is
# available for the Model Lab's confidence display.
#
# Two correctness/quality fixes over the first pass:
# - Split by POLICY, not by row. OPP-115 is only 115 policies each cut
#   into ~30 segments; a random row-level split let segments from the
#   same policy (often near-duplicate boilerplate) land in both train
#   and test, inflating the reported score. GroupShuffleSplit keeps every
#   segment from a given policy on one side only — a fair, if slightly
#   lower, number.
# - Small regularization sweep (C) picked by macro-F1 on a held-out
#   validation split (also grouped), not just a fixed default — this is
#   the fixed corpus's real ceiling in terms of squeezing best quality
#   out of the ~3.7k segments available (OPP-115 is 115 policies, a hard
#   size limit — see ml/fetch_opp115.py's header for why re-parsing
#   differently doesn't add real volume).
import csv
import os

import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, f1_score
from sklearn.model_selection import GroupShuffleSplit
from sklearn.multiclass import OneVsRestClassifier
from sklearn.preprocessing import MultiLabelBinarizer

from ml.stop_words import SAFE_STOP_WORDS
from ml.text_preprocessing import negate_scope

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
IN_PATH = os.path.join(DATA_DIR, "opp115_segments.csv")
OUT_PATH = os.path.join(ARTIFACTS_DIR, "practice_model.joblib")

C_CANDIDATES = [0.1, 0.3, 1.0, 3.0, 10.0]


def load_data():
    texts, label_sets, groups = [], [], []
    with open(IN_PATH, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            texts.append(row["text"])
            label_sets.append(row["categories"].split("|"))
            groups.append(row["policy_id"])
    return texts, label_sets, groups


def group_split(texts, y, groups, test_size, seed):
    splitter = GroupShuffleSplit(n_splits=1, test_size=test_size, random_state=seed)
    idx_a, idx_b = next(splitter.split(texts, y, groups=groups))
    return idx_a, idx_b


def main():
    texts, label_sets, groups = load_data()
    texts = np.array(texts, dtype=object)
    groups = np.array(groups)
    print(f"Loaded {len(texts)} labeled segments across {len(set(groups))} policies")

    mlb = MultiLabelBinarizer()
    y = mlb.fit_transform(label_sets)
    print(f"Categories ({len(mlb.classes_)}): {list(mlb.classes_)}")

    train_idx, temp_idx = group_split(texts, y, groups, test_size=0.3, seed=42)
    val_idx, test_idx = group_split(texts[temp_idx], y[temp_idx], groups[temp_idx], test_size=0.5, seed=42)
    val_idx, test_idx = temp_idx[val_idx], temp_idx[test_idx]

    X_train, y_train = texts[train_idx], y[train_idx]
    X_val, y_val = texts[val_idx], y[val_idx]
    X_test, y_test = texts[test_idx], y[test_idx]
    print(f"Train: {len(X_train)}  Val: {len(X_val)}  Test: {len(X_test)} (split by policy, not row)")

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
    print("\nRegularization sweep (macro-F1 on grouped validation split):")
    for c in C_CANDIDATES:
        clf = OneVsRestClassifier(LogisticRegression(C=c, max_iter=1000, class_weight="balanced"))
        clf.fit(X_train_vec, y_train)
        val_f1 = f1_score(y_val, clf.predict(X_val_vec), average="macro", zero_division=0)
        print(f"  C={c}: macro-F1={val_f1:.4f}")
        if val_f1 > best_f1:
            best_c, best_f1 = c, val_f1

    print(f"Best C: {best_c} (val macro-F1 {best_f1:.4f})")

    # Refit on train+val with the chosen C, evaluate once on the untouched test split.
    from scipy.sparse import vstack
    X_trainval_vec = vstack([X_train_vec, X_val_vec])
    y_trainval = np.vstack([y_train, y_val])

    classifier = OneVsRestClassifier(LogisticRegression(C=best_c, max_iter=1000, class_weight="balanced"))
    classifier.fit(X_trainval_vec, y_trainval)

    y_pred = classifier.predict(X_test_vec)

    print("\n=== Held-out test set report (grouped by policy, real precision/recall/F1) ===")
    print(classification_report(y_test, y_pred, target_names=mlb.classes_, zero_division=0))

    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    joblib.dump({"vectorizer": vectorizer, "classifier": classifier, "label_binarizer": mlb}, OUT_PATH)
    print(f"Saved model artifact to {OUT_PATH}")


if __name__ == "__main__":
    main()
