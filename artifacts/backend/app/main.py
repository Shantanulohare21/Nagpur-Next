import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
try:
    from prometheus_fastapi_instrumentator import Instrumentator
    instrumentator = Instrumentator()
except ImportError:
    instrumentator = None

from fastapi.middleware.cors import CORSMiddleware

from app.models import Base
from app.db_sync import engine
from app.api import auth, patients, studies, uploads, ai, reconstruction, simulation, sandbox


app = FastAPI(title="Shoulder Orthopedic Platform", version="0.1.0")

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

if instrumentator:
    instrumentator.instrument(app).expose(app)

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
app.include_router(simulation.router, prefix="/simulation", tags=["simulation"])
app.include_router(sandbox.router, prefix="/sandbox", tags=["sandbox"])
upload_dir = os.getenv("UPLOAD_DIR", "/data/uploads")
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")
static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "mockup-sandbox", "src", "assets"))
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
async def health_check():
    return {"status": "ok"}
