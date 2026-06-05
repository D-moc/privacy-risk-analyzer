from fastapi import APIRouter
from services.comparator import compare_policies

router = APIRouter()

@router.post("/compare")
def compare(data: dict):

    policy1 = data.get("policy1")
    policy2 = data.get("policy2")

    if not policy1 or not policy2:
        return {
            "error": "Both policies are required"
        }

    return compare_policies(
        policy1,
        policy2
    )