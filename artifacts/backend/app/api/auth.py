from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.post("/login")
async def login(username: str, password: str):
    # TODO: Implement real authentication and JWT generation
    if username == "admin" and password == "admin":
        return {"access_token": "fake-token", "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Invalid credentials")
