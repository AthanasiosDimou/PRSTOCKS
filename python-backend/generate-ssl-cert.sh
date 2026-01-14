#!/bin/bash
# Generate self-signed SSL certificate for HTTPS support

echo "🔒 Generating self-signed SSL certificate for FastAPI backend..."

# Detect the local network IP address
# Get the first IP that is not localhost
DETECTED_IP=$(hostname -I | awk '{for(i=1;i<=NF;i++) if($i!="127.0.0.1" && $i!~/^127\./) {print $i; exit}}')

# Validate that an IP was detected
if [ -z "$DETECTED_IP" ]; then
  echo "⚠️  Warning: Could not detect external IP address. Using localhost only."
  DETECTED_IP="127.0.0.1"
  SAN_IPS="IP:127.0.0.1"
else
  echo "🌐 Detected IP address: $DETECTED_IP"
  SAN_IPS="IP:127.0.0.1,IP:$DETECTED_IP"
fi

# Generate certificate valid for localhost, common private IP ranges, AND the detected IP
openssl req -x509 -newkey rsa:4096 -nodes \
  -out cert.pem \
  -keyout key.pem \
  -days 365 \
  -subj "/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,DNS:*.local,$SAN_IPS"

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
