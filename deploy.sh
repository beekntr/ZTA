#!/bin/bash
# ==============================================================================
# ZTA Firewall Dashboard Deployment Script
# Target: Ubuntu 24.04 + Nginx + Node.js 20+
# Domain: firewall.kshitijsinghbhati.in
#
# Run as your normal user (NOT with sudo): ./deploy.sh
# Only the nginx steps use sudo, so npm and git never run as root.
# nginx and the API run on the same server. Otherwise: API_UPSTREAM=http://<api-host>:8000 bash deploy.sh
# ==============================================================================

set -euo pipefail

DOMAIN="firewall.kshitijsinghbhati.in"
TARGET_DIR="/var/www/zta-dashboard"
REPO="https://github.com/beekntr/ZTA.git"
API_UPSTREAM="${API_UPSTREAM:-http://127.0.0.1:8000}"

if [ "$(id -u)" -eq 0 ]; then
    echo "Run this as your normal user, not root; it calls sudo only where needed."
    exit 1
fi
if [[ ! "$API_UPSTREAM" =~ ^http://[A-Za-z0-9.-]+:[0-9]+$ ]]; then
    echo "API_UPSTREAM must look like http://host:port"
    exit 1
fi

echo "🚀 [1/5] Checking Node.js..."
if ! command -v node &> /dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
    echo "Node.js 20 or newer is required. Install the LTS from https://nodejs.org (e.g. with nvm), then re-run."
    exit 1
fi
echo "✔ Node.js $(node --version), npm $(npm --version)"

echo "📥 [2/5] Fetching code..."
if [ -d "$TARGET_DIR/.git" ]; then
    # Older versions of this script cloned as root; take ownership once.
    sudo chown -R "$USER": "$TARGET_DIR"
    git -C "$TARGET_DIR" pull --ff-only origin main
else
    sudo mkdir -p "$TARGET_DIR"
    sudo chown "$USER": "$TARGET_DIR"
    git clone "$REPO" "$TARGET_DIR"
fi
cd "$TARGET_DIR"

echo "🛠️ [3/5] Installing dependencies and building..."
# Empty base URL: the dashboard calls /api on its own origin, which nginx proxies.
printf 'VITE_API_BASE_URL=\nVITE_REFRESH_INTERVAL=10000\nVITE_LOG_PAGE_SIZE=50\n' > .env.production
npm ci            # exactly the versions in package-lock.json
npm run build

echo "⚙️ [4/5] Configuring Nginx..."
# Shared by the server block and /assets (an add_header inside a location
# replaces all headers inherited from the server block).
sudo tee /etc/nginx/snippets/zta-security-headers.conf > /dev/null << 'EOF'
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Strict-Transport-Security "max-age=31536000" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://ipwho.is https://cloudflareinsights.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" always;
EOF

sed -e "s#__DOMAIN__#$DOMAIN#g" -e "s#__API_UPSTREAM__#$API_UPSTREAM#g" << 'EOF' | sudo tee "/etc/nginx/sites-available/$DOMAIN" > /dev/null
server {
    listen 80;
    server_name __DOMAIN__;
    server_tokens off;

    root /var/www/zta-dashboard/dist;
    index index.html;

    include snippets/zta-security-headers.conf;

    # React Router — SPA routing support
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static asset caching (file names contain a content hash)
    location /assets/ {
        include snippets/zta-security-headers.conf;
        add_header Cache-Control "public, max-age=31536000, immutable" always;
    }

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript
               text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # API Proxy — Reverse Proxy /api/* to FastAPI Backend
    location /api/ {
        proxy_pass __API_UPSTREAM__/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 10s;
        proxy_read_timeout 30s;
    }

    # Health check (database + firewall), not the dashboard page
    location = /health {
        proxy_pass __API_UPSTREAM__/api/health;
    }

    # Block access to hidden files (.env, .git, etc.)
    location ~ /\. {
        deny all;
    }
    location ~ \.(env|git|config)$ {
        deny all;
    }
}
EOF

# Enable site if not already enabled
if [ ! -e "/etc/nginx/sites-enabled/$DOMAIN" ]; then
    sudo ln -s "/etc/nginx/sites-available/$DOMAIN" /etc/nginx/sites-enabled/
fi

echo "🔍 [5/5] Testing & Reloading Nginx..."
sudo nginx -t
sudo systemctl reload nginx

echo "=========================================================================="
echo "🎉 Deployment completed: https://$DOMAIN"
echo "Check: curl -s https://$DOMAIN/api/health"
echo "=========================================================================="
