FROM python:3.9-slim

WORKDIR /app

# Cài đặt các thư viện cần thiết cho PostgreSQL và MySQL
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "etl_script.py"]
