# Negation-scope tagging (classic Pang & Lee 2002 technique) — fixes a
# real bug found by direct testing: even with negation words kept out of
# the stop-word list (see stop_words.py), a plain bag-of-words model
# still gave IDENTICAL predictions for "We sell your data" and "We do
# not sell your data" whenever the negation word and the key verb ended
# up more than one token apart, or the sentence was long. Bigrams alone
# only capture two ADJACENT tokens, not the fact that everything after
# "never"/"without"/"not" until the next clause boundary is negated.
#
# Fix: every word from a negation cue to the next clause-ending
# punctuation gets a "not_" prefix, turning it into a distinct token
# ("not_share" vs "share") a linear bag-of-words model can actually
# weight differently — cheap, no new dependencies, standard technique
# for exactly this failure mode in classical (non-transformer) text
# classifiers.
#
# Must stay importable as `ml.text_preprocessing` (not a bare module)
# since a fitted TfidfVectorizer pickles this function by reference —
# whatever process unpickles the saved model (train scripts, and the
# live admin_ml_test.py route) needs `ml` importable as a package from
# its own working directory, hence backend/ml/__init__.py and always
# running the training scripts as `python -m ml.train_x` from backend/.
import re

NEGATION_CUES = {
    "not", "no", "never", "none", "nobody", "nothing", "nowhere",
    "neither", "nor", "cannot", "cant", "dont", "doesnt", "wont",
    "isnt", "arent", "wasnt", "werent", "without",
}

_WORD_RE = re.compile(r"[a-z]+")
_CLAUSE_SPLIT_RE = re.compile(r"[.,;:!?()\[\]\"]+")


def negate_scope(text):
    text = text.lower().replace("'", "")
    clauses = _CLAUSE_SPLIT_RE.split(text)

    out_clauses = []
    for clause in clauses:
        words = _WORD_RE.findall(clause)
        negating = False
        out_words = []
        for w in words:
            out_words.append(f"not_{w}" if negating else w)
            if w in NEGATION_CUES:
                negating = True
        out_clauses.append(" ".join(out_words))

    return " ".join(out_clauses)
