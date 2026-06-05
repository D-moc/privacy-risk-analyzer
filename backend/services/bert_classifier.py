from transformers import pipeline

classifier = None

LABELS = [
    "Data Collection",
    "Data Sharing",
    "Cookies and Tracking",
    "Data Retention",
    "Advertising",
    "Location Access",
    "User Rights",
    "Security"
]

def get_classifier():
    global classifier

    if classifier is None:
        print(
            "Loading DistilBART-MNLI classifier..."
        )

        classifier = pipeline(
            "zero-shot-classification",
            model="valhalla/distilbart-mnli-12-1",
            device=-1
        )
    return classifier


def classify_clauses(text):

    try:
        if not text:
            return {}

        clf = get_classifier()

        # Prevent very large inputs
        text = text[:2000]

        result = clf(
            text,
            LABELS,
            multi_label=True
        )

        # Always return all labels
        output = {
            label: 0
            for label in LABELS
        }

        for label, score in zip(
            result["labels"],
            result["scores"]
        ):

            output[label] = round(
                score * 100,
                2
            )

        return output

    except Exception as e:
        print(
            "Classifier Error:",
            str(e)
        )

        return {
            label: 0
            for label in LABELS
        }