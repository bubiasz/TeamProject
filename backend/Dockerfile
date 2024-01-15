FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libgl1 \
    python3-dev \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy your application files and model directory into the image
COPY main.py /app/main.py
COPY model.py /app/model.py
COPY facade.py /app/facade.py
COPY vgg_features.py /app/vgg_features.py
COPY requirements.txt /app/
COPY models /app/models
COPY .env /app/.env

# Install Python dependencies
RUN pip install --no-cache-dir --timeout=300 -r requirements.txt

# Expose the port the app runs on
EXPOSE 8000

# Define the command to start the app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]