from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY"),
    timeout=20.0
)

def ask_assistant(
    question,
    policy_data=None
):

    risk_score = "Unknown"
    risk_level = "Unknown"

    if policy_data:
        risk_score = policy_data.get(
            "risk",
            "Unknown"
        )

        if isinstance(
            risk_score,
            (int, float)
        ):

            if risk_score >= 70:
                risk_level = "High"
            elif risk_score >= 40:
                risk_level = "Moderate"
            else:
                risk_level = "Low"

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": """
You are PrivacyLens AI, an expert privacy policy analyst.

Your job is to help users understand:

- Privacy Policies
- Data Collection
- Data Sharing
- Cookies & Tracking
- User Rights
- Security Practices
- Privacy Risks
- Dark Patterns

Rules:

1. Always explain in simple language.
2. Use Markdown formatting.
3. Use headings and bullet points.
4. Avoid legal jargon whenever possible.
5. Keep answers concise but informative.
6. Give practical recommendations.
7. If the user asks whether a policy is safe, explain the factors that determine safety.
8. Focus on user privacy and transparency.

Format every response like this:

## Answer

Short explanation.

## Key Points

- Point 1
- Point 2
- Point 3

## Recommendation

Actionable advice for the user.
"""
                },
                {
    "role": "user",
    "content": f"""

Current Policy Analysis:

Risk Score:
{risk_score}

Risk Level:
{risk_level}

Detected Clauses:
{policy_data.get("clauses") if policy_data else {}}

Detected Dark Patterns:
{policy_data.get("darkPatterns") if policy_data else []}

Privacy Report:
{policy_data.get("report") if policy_data else ""}

IMPORTANT:

- Use ONLY the information above.
- Do NOT invent risks.
- Do NOT claim data sharing unless detected.
- If something is not detected, clearly say so.
- Treat the risk level above as the source of truth.

User Question:

{question}

Answer using the policy analysis whenever possible.
If no policy analysis is available,
answer generally.
"""
}
            ],
            temperature=0.4,
            max_tokens=500
        )

        return response.choices[0].message.content

    except Exception as e:
        print("Chat Error:", str(e))
        return """
## Error

Unable to generate a response at this time.

## Recommendation

Please try again in a few moments.
"""