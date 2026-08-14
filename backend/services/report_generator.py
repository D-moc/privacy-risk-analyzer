from groq import Groq
from dotenv import load_dotenv
import os

# LOAD ENV VARIABLES
load_dotenv()

# GROQ CLIENT
client = Groq(
    api_key=os.getenv("GROQ_API_KEY"),
    timeout=20.0
)


def generate_privacy_report(
    risk_score,
    clauses,
    dark_patterns=None
):
    """
    Generate AI-powered PrivacyLens report
    using Groq Llama model.
    """

    prompt = f"""
You are PrivacyLens, an expert privacy auditor.

Analyze the following privacy policy findings.

Risk Score:
{risk_score}/100

Data Collection:
{clauses.get("data_collection", [])}

Data Sharing:
{clauses.get("data_sharing", [])}

Tracking & Cookies:
{clauses.get("cookies", [])}

Data Retention:
{clauses.get("retention", [])}

Dark Patterns:
{dark_patterns if dark_patterns else []}

Generate a professional PrivacyLens Assessment.

Return the response using Markdown formatting.

Use:

## Headings

**Important findings**

- Bullet points

Keep it professional and readable.

## How Data Is Shared

## Tracking & Cookies

## Key Privacy Concerns

## Recommendation

Requirements:
- Use simple language
- Explain findings clearly
- Mention risks if detected
- Mention positive findings if available
- Maximum 250 words
"""

    try:

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are PrivacyLens AI, a privacy "
                        "policy auditing assistant."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=500
        )

        return response.choices[0].message.content

    except Exception as e:

        print(
            "Groq Report Error:",
            str(e)
        )

        return (
            "Unable to generate PrivacyLens report "
            "at this time."
        )