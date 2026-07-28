# sklearn's built-in stop_words="english" list strips negation words
# ("not", "no", "never", "without", "none", "nor", "cannot", ...) before
# n-grams are even formed — which is catastrophic for this task, where
# negation flips a clause's entire meaning. Confirmed by direct testing:
# with the default list, "We sell your data" and "We do not sell your
# data" produced IDENTICAL severity predictions, because the vectorizer
# never saw "not"/"do not" at all — bigrams like "not sell" can't form
# if "not" is removed from the token stream before bigrams are built.
#
# Fix: use sklearn's own list minus every negation term, so phrases like
# "without your consent" / "never share" / "do not sell" stay intact as
# real features instead of being silently deleted.
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS

NEGATION_WORDS = {
    "not", "no", "never", "none", "nobody", "nothing", "nowhere",
    "neither", "nor", "cannot", "cant", "without", "unless",
}

SAFE_STOP_WORDS = frozenset(ENGLISH_STOP_WORDS - NEGATION_WORDS)
