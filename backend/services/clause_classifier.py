# AI's only job now: read the policy and produce a short list of the
# genuinely important findings a non-technical person would care about.
# The Data Practices breakdown (which categories/how much data) is
# computed separately and deterministically in keyword_scorer.py — this
# file no longer scores or adjusts anything numeric.
import json
import os

from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY"),
    timeout=20.0
)

VALID_SEVERITIES = {"critical", "severe", "moderate", "low", "good"}

SYSTEM_PROMPT = """
You are explaining a privacy policy to an everyday, non-technical
person. You will be given the text of a privacy policy. Respond with
ONLY a JSON object with one key: "findings". No other text.

"findings": a SHORT list of only the things that would genuinely matter
to an ordinary person deciding whether to trust this site — skip minor,
administrative, or purely technical points entirely. Quality over
quantity: 3-6 findings is normal; only go higher if the policy is
unusually bad. Each finding is an object with:
- "label": a short, plain-everyday-English headline (max 10 words) that
  stands completely on its own with NO explanation needed — a normal
  person should understand the concern just from this headline. Write
  it like a human warning a friend, not a legal summary. Never use
  legal/technical jargon, regulation names, or article numbers (e.g.
  never write "GDPR", "Article 13", "controller", "data subject" —
  instead say things like "Doesn't say how long they keep your data").
- "category": a short label for what this is about (e.g. "Data Sharing",
  "Tracking", "Transparency", "Data Retention")
- "severity": one of "critical", "severe", "moderate", "good"
  (do not use "low" — if something is only minor, leave it out entirely)
- "detail": OPTIONAL one short plain sentence (max 12 words) ONLY if the
  label genuinely needs one extra bit of context; otherwise leave it "".

Only include findings actually supported by the text.
"""
# Note: the 6-item GDPR-style disclosure checklist that used to live
# here (who to contact, why they collect data, retention, deletion
# rights, international transfer, regulatory complaints) has moved to
# services/disclosure_checks.py — deterministic detection instead of
# asking Groq to judge the same fixed questions on every single policy,
# which is why AI-sourced findings used to look repetitive across very
# different sites. See that file for why.


def classify_clauses(text):
    if not text:
        return {"findings": []}

    try:
        text = text[:6000]

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": text},
            ],
            temperature=0,
            max_tokens=1000,
            response_format={"type": "json_object"},
        )

        parsed = json.loads(response.choices[0].message.content)

        findings = []
        for item in parsed.get("findings") or []:
            if not isinstance(item, dict):
                continue
            severity = item.get("severity", "low")
            if severity not in VALID_SEVERITIES:
                severity = "low"
            findings.append({
                "label": str(item.get("label", "")).strip()[:80],
                "category": str(item.get("category", "")).strip(),
                "severity": severity,
                "detail": str(item.get("detail", "")).strip()[:280],
            })

        return {"findings": findings}

    except Exception as e:
        print("Classifier Error:", str(e))
        return {"findings": []}
