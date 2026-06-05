from transformers import pipeline

summarizer = None


def get_summarizer():
    global summarizer

    if summarizer is None:
        print("Loading DistilBART Summarizer...")

        summarizer = pipeline(
            "summarization",
            model="sshleifer/distilbart-cnn-12-6"
        )

    return summarizer


def summarize_text(text):

    if not text:
        return "No content available."

    model = get_summarizer()

    text = text[:3000]

    try:
        summary = model(
            text,
            max_length=180,
            min_length=60,
            do_sample=False
        )

        return summary[0]["summary_text"]

    except Exception as e:
        print("Summarizer Error:", str(e))

        return text[:500] + "..."