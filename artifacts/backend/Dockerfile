# Dockerfile for the FastAPI backend (GPU‑enabled)
# -------------------------------------------------
# Base image with Python 3.11 + CUDA 12.4 runtime on Ubuntu 22.04
FROM nvidia/cuda:12.4.1-runtime-ubuntu22.04

# -------------------------------------------------
# Base image with Python 3.11 slim
# (previous python:3.11-slim base removed)

# Create a non‑root user
ARG USERNAME=appuser
ARG UID=1000
RUN useradd -m -u $UID $USERNAME
RUN python3 -m ensurepip && python3 -m pip install --no-cache-dir -r requirements.txtdencies (if any are needed for medical libraries)
# No system packages needed for Python dependencies

# Copy only the backend source and requirements
COPY requirements.txt ./requirements.txt
COPY app ./app

# Install Python dependencies using pip3
RUN pip3 install --no-cache-dir -r requirements.txt

# Switch to non‑root user
USER $USERNAME

# Expose the API port (frontend expects 5003)
EXPOSE 5003

# Start the FastAPI server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5003"]
