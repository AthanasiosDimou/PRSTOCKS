#!/bin/bash
set -e # Exit immediately if a command fails

echo "Script started at $(date)"

# 1. Export Path for Node/PNPM
# Ensure these paths match where your node and pnpm actually are
export PATH=/usr/local/bin:/usr/bin:/bin:/home/einshadow/.local/share/pnpm:/home/einshadow/.nvm/versions/node/v20.0.0/bin:$PATH

# 2. Navigate to project
cd /home/einshadow/PRSTOCKS

# 3. Install if missing
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    pnpm install
fi

# 4. Run the server
echo "Starting Frontend..."
# Ensure pnpm binds to network
pnpm dev --host
