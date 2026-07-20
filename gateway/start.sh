#!/bin/bash
set -e

echo "Initializing Gateway & Daemon..."

mkdir -p ~/.onchainos ~/.openclaw

# Inject Agent Identity (wallets.json)
if [ -f "/etc/secrets/wallets.json" ]; then
    cp /etc/secrets/wallets.json ~/.onchainos/wallets.json
    echo "wallets.json identity injected successfully."
else
    echo "WARNING: /etc/secrets/wallets.json not found! The agent will not be able to authenticate on mainnet."
fi

# Inject Gateway Configuration (openclaw.json)
if [ -f "/etc/secrets/openclaw.json" ]; then
    cp /etc/secrets/openclaw.json ~/.openclaw/openclaw.json
    echo "openclaw.json configuration injected successfully."
else
    echo "Using default openclaw.json configuration..."
    cat <<EOF > ~/.openclaw/openclaw.json
{
  "plugins": {
    "entries": {
      "okx-a2a": {
        "enabled": true,
        "hooks": {
          "allowConversationAccess": true
        }
      }
    }
  },
  "gateway": {
    "mode": "remote",
    "auth": {
      "mode": "token",
      "token": "${GATEWAY_TOKEN:-openclaw_auth_token}"
    }
  }
}
EOF
fi

# Start okx-a2a daemon in the background
echo "Starting okx-a2a daemon..."
okx-a2a daemon start --ai-provider openclaw &

sleep 5

# Start openclaw gateway in the foreground
echo "Starting openclaw gateway on port 18789..."
openclaw gateway run --port 18789 --allow-unconfigured
