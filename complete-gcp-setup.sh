#!/bin/bash

VM_IP="35.202.31.94"
ZONE="us-central1-a"
VM_NAME="teecole-server"

echo "🚀 Completing GCP Deployment..."
echo ""

# Execute all setup commands in one SSH session
gcloud compute ssh $VM_NAME --zone=$ZONE << 'EOF'
# Fix permissions
sudo chown -R ubuntu:ubuntu /home/ubuntu/teecole

# Install backend dependencies
cd /home/ubuntu/teecole/backend
npm install --omit=dev

# Install frontend dependencies and build
cd /home/ubuntu/teecole/frontend
npm install
npm run build

# Create .env file
cd /home/ubuntu/teecole/backend
cat > .env << 'ENVEOF'
PORT=5001
NODE_ENV=production
FRONTEND_URL=http://35.202.31.94

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=info@teecoleltd.com
EMAIL_TO=grace@teecoleltd.com
ENVEOF

# Start backend with PM2
pm2 start src/server.js --name teecole-backend
pm2 save

# Configure Nginx
sudo bash -c 'cat > /etc/nginx/sites-available/teecole << "NGINXEOF"
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        root /home/ubuntu/teecole/frontend/build;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # Uploads
    location /uploads {
        alias /home/ubuntu/teecole/backend/uploads;
    }
}
NGINXEOF'

# Enable site and restart nginx
sudo ln -sf /etc/nginx/sites-available/teecole /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

echo "✅ Setup complete!"
pm2 list
EOF

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "🌐 Access your app at: http://35.202.31.94"
echo "🔐 Admin panel: http://35.202.31.94/admin/login"
echo "   Credentials: admin / admin123"
echo ""
