#!/bin/bash

# Teecole Google Cloud Platform Deployment Script
# Automated deployment to GCP Compute Engine

set -e

echo "🚀 Teecole GCP Deployment Script"
echo "================================="
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Variables
VM_USER="ubuntu"
APP_DIR="/home/ubuntu/teecole"

# Check if VM IP is provided
if [ -z "$1" ]; then
    echo "❌ Error: VM IP is required"
    echo "Usage: ./deploy-gcp.sh <VM_IP> [VM_NAME] [ZONE]"
    echo ""
    echo "Example: ./deploy-gcp.sh 34.123.45.67 teecole-server us-central1-a"
    exit 1
fi

VM_IP=$1
VM_NAME=${2:-teecole-server}
ZONE=${3:-us-central1-a}

echo "📋 Deployment Configuration:"
echo "   VM IP: $VM_IP"
echo "   VM Name: $VM_NAME"
echo "   Zone: $ZONE"
echo "   App Directory: $APP_DIR"
echo ""

# Function to run commands on VM
run_on_vm() {
    gcloud compute ssh $VM_NAME --zone=$ZONE --command="$1"
}

# Step 1: Initial setup
echo "📦 Step 1: Installing dependencies on GCP VM..."
run_on_vm '
    # Update system
    sudo apt-get update && sudo apt-get upgrade -y
    
    # Install Node.js 18.x
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    # Install PM2
    if ! command -v pm2 &> /dev/null; then
        sudo npm install -g pm2
    fi
    
    # Install Nginx
    if ! command -v nginx &> /dev/null; then
        sudo apt-get install -y nginx
    fi
    
    # Install Git
    if ! command -v git &> /dev/null; then
        sudo apt-get install -y git
    fi
    
    # Install Google Cloud Ops Agent for monitoring
    if [ ! -f /opt/google-cloud-ops-agent/bin/google-cloud-ops-agent ]; then
        curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh
        sudo bash add-google-cloud-ops-agent-repo.sh --also-install
        rm add-google-cloud-ops-agent-repo.sh
    fi
    
    echo "✅ Dependencies installed"
'

# Step 2: Clone or update repository
echo "📥 Step 2: Cloning/Updating repository..."
run_on_vm "
    if [ -d \"$APP_DIR\" ]; then
        cd $APP_DIR
        git pull origin main
        echo \"✅ Repository updated\"
    else
        cd /home/ubuntu
        git clone https://github.com/fgeorge0307/teecole.git
        echo \"✅ Repository cloned\"
    fi
"

# Step 3: Install dependencies
echo "📦 Step 3: Installing application dependencies..."
run_on_vm "
    # Backend dependencies
    cd $APP_DIR/backend
    npm install --production
    
    # Frontend dependencies
    cd $APP_DIR/frontend
    npm install
    
    echo \"✅ Dependencies installed\"
"

# Step 4: Build frontend
echo "🏗️  Step 4: Building frontend..."
run_on_vm "
    cd $APP_DIR/frontend
    npm run build
    echo \"✅ Frontend built\"
"

# Step 5: Configure environment
echo "⚙️  Step 5: Configuring environment..."
run_on_vm "
    # Create backend .env if not exists
    if [ ! -f \"$APP_DIR/backend/.env\" ]; then
        cat > $APP_DIR/backend/.env << 'ENVFILE'
PORT=5001
NODE_ENV=production
FRONTEND_URL=http://$VM_IP
JWT_SECRET=\$(openssl rand -base64 32)
ENVFILE
        echo \"✅ Environment file created\"
    else
        echo \"⚠️  Environment file already exists, skipping\"
    fi
"

# Step 6: Setup PM2
echo "🔄 Step 6: Setting up PM2..."
run_on_vm "
    cd $APP_DIR/backend
    
    # Stop existing process
    pm2 stop teecole-backend 2>/dev/null || true
    pm2 delete teecole-backend 2>/dev/null || true
    
    # Start new process
    pm2 start src/server.js --name teecole-backend
    pm2 save
    
    # Setup PM2 startup
    sudo env PATH=\$PATH:/usr/bin pm2 startup systemd -u $VM_USER --hp /home/$VM_USER
    
    echo \"✅ PM2 configured\"
"

# Step 7: Configure Nginx
echo "🌐 Step 7: Configuring Nginx..."
run_on_vm "
    # Create Nginx config
    sudo tee /etc/nginx/sites-available/teecole > /dev/null << 'NGINXCONF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name $VM_IP _;

    # Frontend
    location / {
        root $APP_DIR/frontend/build;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \\.(?:css|js|jpg|jpeg|gif|png|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control \"public, immutable\";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Uploads
    location /uploads {
        alias $APP_DIR/backend/uploads;
        expires 1y;
        add_header Cache-Control \"public\";
    }

    # Security headers
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
NGINXCONF

    # Enable site
    sudo ln -sf /etc/nginx/sites-available/teecole /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test and restart Nginx
    sudo nginx -t
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    echo \"✅ Nginx configured\"
"

# Step 8: Setup firewall (using GCP firewall rules, not ufw)
echo "🔥 Step 8: Firewall is managed by GCP..."
echo "   Make sure you have created firewall rules:"
echo "   - allow-http (tcp:80)"
echo "   - allow-https (tcp:443)"

# Step 9: Create backup script for Cloud Storage
echo "💾 Step 9: Setting up database backup..."
run_on_vm '
    mkdir -p /home/ubuntu/backups
    
    # Create backup script
    cat > /home/ubuntu/backup-to-gcs.sh << '"'"'BACKUPSCRIPT'"'"'
#!/bin/bash
BACKUP_FILE="teecole_backup_$(date +%Y%m%d_%H%M%S).db"
DB_PATH="'"$APP_DIR"'/backend/teecole.db"
BUCKET="gs://teecole-backups"

# Check if database exists
if [ -f "$DB_PATH" ]; then
    # Backup database
    sqlite3 $DB_PATH ".backup '"'"'/tmp/$BACKUP_FILE'"'"'"
    
    # Check if gsutil is available
    if command -v gsutil &> /dev/null; then
        # Upload to Cloud Storage
        gsutil cp /tmp/$BACKUP_FILE $BUCKET/ 2>/dev/null || echo "Warning: Could not upload to Cloud Storage"
    else
        # Keep local backup
        mv /tmp/$BACKUP_FILE /home/ubuntu/backups/
    fi
    
    # Cleanup old local backups (keep last 7 days)
    find /home/ubuntu/backups -name "teecole_backup_*.db" -mtime +7 -delete
    
    echo "✅ Backup completed: $BACKUP_FILE"
else
    echo "❌ Database file not found: $DB_PATH"
fi
BACKUPSCRIPT

    chmod +x /home/ubuntu/backup-to-gcs.sh
    
    # Add to crontab if not exists
    (crontab -l 2>/dev/null | grep -v backup-to-gcs.sh; echo "0 2 * * * /home/ubuntu/backup-to-gcs.sh") | crontab -
    
    echo "✅ Backup script configured"
'

# Step 10: Health check
echo "🏥 Step 10: Performing health check..."
sleep 5

run_on_vm "
    # Check if backend is running
    if pm2 list | grep -q teecole-backend; then
        echo \"✅ Backend is running\"
    else
        echo \"❌ Backend is not running\"
    fi
    
    # Check if Nginx is running
    if sudo systemctl is-active --quiet nginx; then
        echo \"✅ Nginx is running\"
    else
        echo \"❌ Nginx is not running\"
    fi
"

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "   1. Visit your app: http://$VM_IP"
echo "   2. Admin login: http://$VM_IP/admin/login"
echo "   3. Default credentials: admin / admin123"
echo "   4. IMPORTANT: Change admin password immediately!"
echo ""
echo "🔧 Optional Setup:"
echo "   1. Reserve static IP:"
echo "      gcloud compute addresses create teecole-ip --region=\$(gcloud compute zones describe $ZONE --format='value(region)')"
echo ""
echo "   2. Set up Cloud Storage backup bucket:"
echo "      gsutil mb gs://teecole-backups"
echo ""
echo "   3. Configure domain and SSL:"
echo "      See GCP_DEPLOYMENT.md for instructions"
echo ""
echo "🔍 Useful Commands:"
echo "   SSH to VM: gcloud compute ssh $VM_NAME --zone=$ZONE"
echo "   Check PM2: gcloud compute ssh $VM_NAME --zone=$ZONE --command='pm2 status'"
echo "   View logs: gcloud compute ssh $VM_NAME --zone=$ZONE --command='pm2 logs teecole-backend'"
echo "   Restart: gcloud compute ssh $VM_NAME --zone=$ZONE --command='pm2 restart teecole-backend'"
echo ""
echo "🎉 Happy deploying on Google Cloud!"
