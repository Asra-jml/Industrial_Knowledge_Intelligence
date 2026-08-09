# IKI Backend — production Docker image
# Supports: FastAPI (F1–F5), OCR (pytesseract), and all ML deps.

FROM python:3.12-slim AS base

# System dependencies: Tesseract OCR + build essentials for faiss-cpu
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        tesseract-ocr \
        libglib2.0-0 \
        libgl1 \
        libsm6 \
        libxext6 \
        libxrender1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps first (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    python -m spacy download en_core_web_sm

# Copy backend code
COPY backend/ ./backend/

# Copy scripts for verification (optional)
COPY scripts/ ./scripts/

# Copy root-level files
COPY prebuild_index.py .
COPY test_compliance.py .
COPY test_copilot.py .

# Expose the API port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Run FastAPI via uvicorn
CMD ["uvicorn", "backend.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
