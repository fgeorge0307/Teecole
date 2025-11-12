#!/bin/bash

# Teecole AWS Deployment Script
# This script automates the deployment of Teecole app to AWS EC2

set -e  # Exit on error

echo "🚀 Teecole AWS Deployment Script"
echo "================================="
echo ""

# Variables
EC2_USER="ubuntu"
APP_DIR="/home/ubuntu/teecole"

# Check if EC2 host is provided
if [ -z "$1" ]; then
    echo "❌ Error: EC2 host IP is required"
    echo "Usage: ./deploy-aws.sh <EC2_PUBLIC_IP> <path-to-key.pem>"
    exit 1
fi

if [ -z "$2" ]; then
    echo "❌ Error: SSH key path is required"
    echo "Usage: ./deploy-aws.sh <EC2_PUBLIC_IP> <path-to-key.pem>"
    exit 1
fi

EC2_HOST=$1
SSH_KEY=$2

echo "📋 Deployment Configuration:"
echo "   EC2 Host: $EC2_HOST"
echo "   SSH Key: $SSH_KEY"
echo "   App Directory: $APP_DIR"
echo ""

# Function to run commands on EC2
run_on_ec2() {
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "$@"
}

# Step 1: Initial setup
echo "📦 Step 1: Installing dependencies on EC2..."
run_on_ec2 << 'EOF'
    # Update system
    sudo apt update && sudo apt upgrade -y
    
    # Install Node.js
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt install -y nodejs
    fi
    
    # Install PM2
    if ! command -v pm2 &> /dev/null; then
        sudo npm install -g pm2
    fi
    
    # Install Nginx
    if ! command -v nginx &> /dev/null; then
        sudo apt install -y nginx
    fi
    
    # Install Git
    if ! command -v git &> /dev/null; then
        sudo apt install -y git
    fi
    
    echo "✅ Dependencies installed"
EOF

# Step 2: Clone or update repository
echo "📥 Step 2: Cloning/Updating repository..."
run_on_ec2 << EOF
    if [ -d "$APP_DIR" ]; then
        cd $APP_DIR
        git pull origin main
        echo "✅ Repository updated"
    else
        cd /home/ubuntu
        git clone https://github.com/fgeorge0307/teecole.git
        echo "✅ Repository cloned"
    fi
EOF

# Step 3: Install dependencies
echo "📦 Step 3: Installing application dependencies..."
run_on_ec2 << EOF
    # Backend dependencies
    cd $APP_DIR/backend
    npm install --production
    
    # Frontend dependencies
    cd $APP_DIR/frontend
    npm install
    
    echo "✅ Dependencies installed"
EOF

# Step 4: Build frontend
echo "🏗️  Step 4: Building frontend..."
run_on_ec2 << EOF
    cd $APP_DIR/frontend
    npm run build
    echo "✅ Frontend built"
EOF

# Step 5: Configure environment
echo "⚙️  Step 5: Configuring environment..."
run_on_ec2 << EOF
    # Create backend .env if not exists
    if [ ! -f "$APP_DIR/backend/.env" ]; then
        cat > $APP_DIR/backend/.env << 'ENVFILE'
PORT=5001
NODE_ENV=production
FRONTEND_URL=http://$EC2_HOST
JWT_SECRET=$(openssl rand -base64 32)
ENVFILE
        echo "✅ Environment file created"
    else
        echo "⚠️  Environment file already exists, skipping"
    fi
EOF

# Step 6: Setup PM2
echo "🔄 Step 6: Setting up PM2..."
run_on_ec2 << EOF
    cd $APP_DIR/backend
    
    # Stop existing process
    pm2 stop teecole-backend 2>/dev/null || true
    pm2 delete teecole-backend 2>/dev/null || true
    
    # Start new process
    pm2 start src/server.js --name teecole-backend
    pm2 save
    
    # Setup PM2 startup
    sudo env PATH=\$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
    
    echo "✅ PM2 configured"
EOF

# Step 7: Configure Nginx
echo "🌐 Step 7: Configuring Nginx..."
run_on_ec2 << EOF
    # Create Nginx config
    sudo tee /etc/nginx/sites-available/teecole > /dev/null << 'NGINXCONF'
server {
    listen 80;
    server_name $EC2_HOST;

    # Frontend
    location / {
        root $APP_DIR/frontend/build;
        try_files \$uri \$uri/ /index.html;
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
    }

    # Uploads
    location /uploads {
        alias $APP_DIR/backend/uploads;
    }
}
NGINXCONF

    # Enable site
    sudo ln -sf /etc/nginx/sites-available/teecole /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test and restart Nginx
    sudo nginx -t
    sudo systemctl restart nginx
    
    echo "✅ Nginx configured"
EOF

# Step 8: Setup firewall
echo "🔥 Step 8: Configuring firewall..."
run_on_ec2 << EOF
    sudo ufw --force enable
    sudo ufw allow 'Nginx Full'
    sudo ufw allow OpenSSH
    echo "✅ Firewall configured"
EOF

# Step 9: Create backup script
echo "💾 Step 9: Setting up database backup..."
run_on_ec2 << 'EOF'
    mkdir -p /home/ubuntu/backups
    
    cat > /home/ubuntu/backup-db.sh << 'BACKUPSCRIPT'
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DB_PATH="$APP_DIR/backend/teecole.db"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
if [ -f "$DB_PATH" ]; then
    sqlite3 $DB_PATH ".backup '$BACKUP_DIR/teecole_backup_$DATE.db'"
    find $BACKUP_DIR -name "teecole_backup_*.db" -mtime +7 -delete
    echo "✅ Backup completed: teecole_backup_$DATE.db"
fi
BACKUPSCRIPT

    chmod +x /home/ubuntu/backup-db.sh
    
    # Add to crontab if not exists
    (crontab -l 2>/dev/null | grep -v backup-db.sh; echo "0 2 * * * /home/ubuntu/backup-db.sh") | crontab -
    
    echo "✅ Backup script configured"
EOF

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "   1. Visit your app: http://$EC2_HOST"
echo "   2. Admin login: http://$EC2_HOST/admin/login"
echo "   3. Default credentials: admin / admin123"
echo "   4. IMPORTANT: Change admin password immediately!"
echo ""
echo "🔍 Useful Commands:"
echo "   Check PM2 status: ssh -i $SSH_KEY $EC2_USER@$EC2_HOST 'pm2 status'"
echo "   View logs: ssh -i $SSH_KEY $EC2_USER@$EC2_HOST 'pm2 logs teecole-backend'"
echo "   Restart app: ssh -i $SSH_KEY $EC2_USER@$EC2_HOST 'pm2 restart teecole-backend'"
echo ""
echo "🎉 Happy deploying!"
