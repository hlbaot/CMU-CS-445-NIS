FROM python:3.9-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Chạy FastAPI bằng uvicorn
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5001"]
