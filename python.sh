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

# 4. Run the app
echo "Starting Python Backend..."
# This runs 'main.py' or module 'main' using the venv python
$VENV_PYTHON -m uv run main || $VENV_PYTHON main.py
