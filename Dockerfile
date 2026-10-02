# ============================================================
# Multi-Stage Build: Fullstack MyBoard (Frontend + Backend)
# Runs as 1 unified service on Railway, Koyeb, Fly.io, Zeabur, Hugging Face
# ============================================================

# Step 1: Build Frontend SPA
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Step 2: Python Backend Runtime
FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend/ ./backend/
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

WORKDIR /app/backend

EXPOSE 5000
ENV PORT=5000

CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-5000} run:app"]
