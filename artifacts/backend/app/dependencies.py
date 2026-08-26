from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_session

async def get_db() -> AsyncSession:
    async for session in get_session():
        yield session
