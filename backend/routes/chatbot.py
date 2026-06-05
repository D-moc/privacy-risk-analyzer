from fastapi import APIRouter, Request
from services.chat_service import ask_assistant

router = APIRouter()

@router.post("/chat")
async def chat(request: Request):

    data = await request.json()

    question = data.get("question")
    policy_data = data.get("policy_data")

    if not question:
        return {
            "answer": "Please ask a question."
        }

    answer = ask_assistant(
        question,
        policy_data
    )

    return {
        "answer": answer
    }