from transformers import pipeline

classifier = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english",
    device=-1  # CPU
)

def classify_clauses(text):
    """
    Classify text sentiment (used as lightweight AI signal)
    """

    try:
        # SAFETY CHECK
        if not text:
            return []

        # LIMIT INPUT
        text = text[:512]

        # RUN MODEL
        results = classifier(text)

        return results

    except Exception as e:
        print("BERT Error:", str(e))
        return []