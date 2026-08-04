FROM python:3.11-slim

WORKDIR /app

# Copy dependency list first for better layer caching
COPY requirements.txt .

# Install CPU-only PyTorch first
RUN pip install --no-cache-dir \
    torch \
    --index-url https://download.pytorch.org/whl/cpu

# Install remaining Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the embedding model during image build
ENV HF_HOME=/app/.cache/huggingface

RUN python -c "from sentence_transformers import SentenceTransformer; \
SentenceTransformer('BAAI/bge-small-en-v1.5')"

# Copy application source code
COPY . .

EXPOSE 5000

# Gunicorn configuration
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "app:app"]