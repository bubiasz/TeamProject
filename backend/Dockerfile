FROM python:3.9-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    libgl1 \
    python3-dev \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY main.py model.py facade.py vgg_features.py /app/
COPY models /app/models
COPY requirements.txt /app
COPY static/birds /app/static/birds

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
