# Use slim Python 3.11 for better compatibility with dependencies
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libsndfile1 \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create and use virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download NLP models at build time (faster startup)
RUN python -m spacy download en_core_web_sm && \
    python -c "import nltk; nltk.download('punkt'); nltk.download('punkt_tab', quiet=True)"

# Copy application code
COPY . .

# Create temp directory for video frames
RUN mkdir -p /tmp/frames

# Set environment variables
ENV PORT=8080
ENV PYTHONUNBUFFERED=1
ENV WORKERS=1

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Use Gunicorn with Uvicorn workers for better performance
# Single worker to avoid duplicate model downloads on cold start
# Increased timeout to 600s (10 min) for model downloads
CMD exec gunicorn main:app \
    --workers 1 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:$PORT \
    --timeout 600 \
    --graceful-timeout 30 \
    --keep-alive 5
