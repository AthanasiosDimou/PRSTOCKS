#!/bin/bash
set -e

echo "Script started at $(date)"

# 1. Navigate to directory
cd /home/einshadow/PRSTOCKS/python-backend

# 2. Define the path to the virtual environment python
VENV_PYTHON="/home/einshadow/PRSTOCKS/python-backend/myvenv/bin/python"

# 3. Install requirements (Standard pip is safer if uv is missing)
if [ -f "requirements.txt" ]; then
    echo "Installing requirements..."
    $VENV_PYTHON -m pip install -r requirements.txt
fi

# 3.5. Generate Self-Signed Certificates for HTTPS (Required for Mobile Camera)
if [ ! -f "key.pem" ] || [ ! -f "cert.pem" ]; then
    echo "🔒 Generating self-signed SSL certificates for HTTPS support..."
    openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=PRStocks"
    chmod 644 key.pem cert.pem
    echo "✅ Certificates generated."
fi

# 4. Run the app
echo "Starting Python Backend..."
# This runs 'main.py' or module 'main' using the venv python
$VENV_PYTHON -m uv run main || $VENV_PYTHON main.py
