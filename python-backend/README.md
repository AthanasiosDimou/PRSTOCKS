# Python Backend - HTTPS Setup

## Quick Start (Raspberry Pi / Linux)

### Enable HTTPS for external device connections:

```bash
cd python-backend
chmod +x generate-ssl-cert.sh
./generate-ssl-cert.sh
```

This generates `cert.pem` and `key.pem` files. The backend will automatically use them.

### Run the backend:

```bash
# Option 1: Direct Python
python main.py

# Option 2: With uvicorn (if installed globally)
uvicorn main:app --host 0.0.0.0 --port 8000 --ssl-keyfile key.pem --ssl-certfile cert.pem
```

## Why HTTPS?

The frontend uses HTTPS (for barcode scanner camera access). Browsers block mixed content (HTTPS frontend → HTTP backend) when accessed from external devices.

## Security Note

The generated certificate is **self-signed** and for **development only**. When accessing from phones/tablets, you'll see a security warning - click "Advanced" → "Proceed anyway" to accept it.
