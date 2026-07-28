from fastapi import APIRouter
from services.comparator import compare_policies

router = APIRouter()

@router.post("/compare")
async def compare(data: dict):

    policy1 = data.get("policy1")
    policy2 = data.get("policy2")
    preference = data.get("preference", "moderate")

    if not policy1 or not policy2:
        return {
            "error": "Both policies are required"
        }

    return await compare_policies(
        policy1,
        policy2,
        preference,
    )
