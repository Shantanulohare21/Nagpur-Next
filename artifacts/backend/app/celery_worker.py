from celery import Celery
import os
from datetime import datetime

# Celery configuration – broker and backend read from environment variables
celery_app = Celery(
    "reconstruction_worker",
    broker=os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0"),
    backend=os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/0"),
)

# Ensure tasks are discovered when the worker starts
celery_app.autodiscover_tasks(["app.tasks"])
