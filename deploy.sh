#!/bin/bash
# ==============================================================================
# ZTA Firewall Dashboard Deployment Script
# Target: Ubuntu 24.04 + Nginx + Node.js
# Domain: firewall.kshitijsinghbhati.in
# ==============================================================================

set -e

echo "🚀 [1/6] Checking Environment & Dependencies..."
if ! command -v node &> /dev/null; then
    echo "➜ Node.js not found. Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✔ Node.js version: $(node --version)"
    echo "✔ npm version: $(npm --version)"
fi

TARGET_DIR="/var/www/zta-dashboard"
if [ -d "$TARGET_DIR" ]; then
    echo "➜ Pulling latest code into $TARGET_DIR..."
    cd "$TARGET_DIR"
    sudo git pull origin main
else
    echo "➜ Cloning repository to $TARGET_DIR..."
    sudo git clone https://github.com/beekntr/ZTA.git "$TARGET_DIR"
    cd "$TARGET_DIR"
fi

echo "📦 [2/6] Setting up Production Environment Config..."
sudo tee .env.production > /dev/null << 'EOF'
VITE_API_BASE_URL=https://firewall.kshitijsinghbhati.in
VITE_REFRESH_INTERVAL=10000
VITE_LOG_PAGE_SIZE=50
EOF
echo "✔ Created .env.production"

echo "📥 [3/6] Installing Node Dependencies..."
sudo npm ci || sudo npm install

echo "🛠️ [4/6] Building Production Bundle..."
sudo npm run build

echo "⚙️ [5/6] Configuring Nginx Site..."
sudo tee /etc/nginx/sites-available/firewall.kshitijsinghbhati.in > /dev/null << 'EOF'
server {
    listen 80;
    server_name firewall.kshitijsinghbhati.in;

    root /var/www/zta-dashboard/dist;
    index index.html;

    # React Router — SPA routing support
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static asset caching
    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json 
               application/javascript text/xml 
               application/xml application/xml+rss text/javascript;

    # API Proxy — Reverse Proxy /api/* to FastAPI Backend
    location /api/ {
        proxy_pass http://192.168.1.6:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 10s;
        proxy_read_timeout 30s;
    }

    # Health Check Proxy
    location /health {
        proxy_pass http://192.168.1.6:8000/health;
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
if [ ! -f /etc/nginx/sites-enabled/firewall.kshitijsinghbhati.in ]; then
    sudo ln -s /etc/nginx/sites-available/firewall.kshitijsinghbhati.in /etc/nginx/sites-enabled/
fi

echo "🔍 [6/6] Testing & Reloading Nginx..."
sudo nginx -t
sudo systemctl reload nginx

echo "=========================================================================="
echo "🎉 Deployment successfully completed!"
echo "Dashboard path: /var/www/zta-dashboard/dist"
echo "URL: http://firewall.kshitijsinghbhati.in"
echo ""
echo "Next steps for SSL (Run once):"
echo "sudo certbot --nginx -d firewall.kshitijsinghbhati.in"
echo "=========================================================================="
