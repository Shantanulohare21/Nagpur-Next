import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from prometheus_fastapi_instrumentator import Instrumentator
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, patients, studies, uploads, ai, reconstruction

app = FastAPI(title="Shoulder Orthopedic Platform", version="0.1.0")
Instrumentor = Instrumentator()
Instrumentor.instrument(app).expose(app)

# Allow frontend (likely on different port) to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Placeholder router inclusion – actual router modules will be added later
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(patients.router, prefix="/patients", tags=["patients"])
app.include_router(studies.router, prefix="/studies", tags=["studies"])
app.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
app.include_router(ai.router, prefix="/ai", tags=["ai"])
app.include_router(reconstruction.router, prefix="/reconstruction", tags=["reconstruction"])

@app.get("/")
async def health_check():
    return {"status": "ok"}
