# ==========================================
# Stage 1: Builder
# Compiles and installs all heavy dependencies
# ==========================================
FROM python:3.11-slim AS builder

WORKDIR /app

# Install system build dependencies (often needed for compiling ML libs on ARM architectures)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Create a virtual environment to isolate dependencies
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy just the requirements first to leverage Docker layer caching
COPY requirements.txt .

# Upgrade pip and install dependencies
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ==========================================
# Stage 2: Production Runtime
# The final, lightweight image deployed to OCI
# ==========================================
FROM python:3.11-slim

WORKDIR /app

# Install ONLY the system dependencies required at runtime (OpenCV needs these)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy the fully built virtual environment from the builder stage
COPY --from=builder /opt/venv /opt/venv

# Activate the virtual environment in the container
ENV PATH="/opt/venv/bin:$PATH"

# Copy the pre-downloaded AI models FIRST
# (If code changes but models don't, Docker caches this massive layer)
COPY models/ ./models/
RUN chmod -R 755 /app/models
# Ensure the app can actually read the model files
RUN chmod -R 644 /app/models/*.h5
RUN chmod 755 /app/models

# Copy the rest of the Flask application code
COPY . .

# Expose the port Gunicorn will serve on
EXPOSE 5000

# Start the server with Gunicorn (optimized for production ML workloads)
# FIX 2 & 3: --workers=1 prevents OOM (each TF load = 133MB), --timeout=120 allows 2min for model loading
CMD ["gunicorn", "--workers=1", "--timeout=120", "--bind=0.0.0.0:5000", "app:app"]