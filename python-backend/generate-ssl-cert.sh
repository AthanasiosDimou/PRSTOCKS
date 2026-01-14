#!/bin/bash
# Generate self-signed SSL certificate for HTTPS support

echo "🔒 Generating self-signed SSL certificate for FastAPI backend..."

# Detect the local network IP address
# Get the first IP that is not localhost
DETECTED_IP=$(hostname -I | awk '{print $1}')
echo "🌐 Detected IP address: $DETECTED_IP"

# Generate certificate valid for localhost, common private IP ranges, AND the detected IP
openssl req -x509 -newkey rsa:4096 -nodes \
  -out cert.pem \
  -keyout key.pem \
  -days 365 \
  -subj "/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,DNS:*.local,IP:127.0.0.1,IP:$DETECTED_IP"

chmod 600 key.pem
chmod 644 cert.pem

echo "✅ SSL certificates generated successfully!"
echo "📁 Files created:"
echo "   - cert.pem (certificate)"
echo "   - key.pem (private key)"
echo ""
echo "⚠️  Note: This is a self-signed certificate for development only."
echo "📱 When accessing from external devices, you may need to accept the security warning."
echo "   Access the backend directly at https://$DETECTED_IP:8000/api/health to accept the certificate."
