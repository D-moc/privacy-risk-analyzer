from fastapi import APIRouter, Request
from transformers import pipeline

router = APIRouter()

# FIXED PIPELINE
qa_pipeline = pipeline(
    "question-answering",
    model="distilbert-base-cased-distilled-squad"
)

@router.post("/chat")
async def chat(request: Request):
    data = await request.json()

    question = data.get("question")
    context = data.get("context")

    if not question or not context:
        return {"answer": "Invalid input"}

    result = qa_pipeline(
        question=question,
        context=context
    )

    return {"answer": result["answer"]}