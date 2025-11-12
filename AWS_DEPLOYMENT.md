# AWS Deployment Guide for Teecole Limited

This guide will help you deploy the Teecole Limited website to AWS.

## Deployment Architecture

### Option 1: Simple EC2 Deployment (Recommended for Start)
- **EC2 Instance**: Host both frontend and backend
- **SQLite**: Keep local database
- **Elastic IP**: Static IP address
- **Security Groups**: Configure firewall rules

### Option 2: Production Architecture
- **EC2 Instance**: Host Node.js backend
- **S3 + CloudFront**: Host React frontend (static files)
- **RDS**: PostgreSQL/MySQL database (instead of SQLite)
- **Route 53**: Custom domain management
- **Load Balancer**: For high availability

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **SSH Key Pair** created in AWS Console
4. **Domain Name** (optional, for custom domain)

## Option 1: EC2 Deployment (Simple Setup)

### Step 1: Launch EC2 Instance

1. **Go to EC2 Dashboard**
2. **Launch Instance** with these settings:
   - **Name**: `teecole-server`
   - **AMI**: Ubuntu Server 22.04 LTS
   - **Instance Type**: t2.small (or t2.micro for testing)
   - **Key Pair**: Select or create new
   - **Security Group**: Create with these rules:
     - SSH (22) - Your IP
     - HTTP (80) - Anywhere
     - HTTPS (443) - Anywhere
     - Custom TCP (5001) - Anywhere (for API)
     - Custom TCP (3000) - Anywhere (for React dev, remove in production)

3. **Launch Instance**

### Step 2: Connect to EC2

```bash
# Download your key pair and set permissions
chmod 400 your-key.pem

# Connect via SSH
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

### Step 3: Install Dependencies on EC2

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx (Reverse Proxy)
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

### Step 4: Clone and Setup Application

```bash
# Clone repository
cd /home/ubuntu
git clone https://github.com/fgeorge0307/teecole.git
cd teecole

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Build frontend for production
npm run build
```

### Step 5: Configure Environment Variables

```bash
# Create backend .env file
cd /home/ubuntu/teecole/backend
nano .env
```

Add:
```env
PORT=5001
NODE_ENV=production
FRONTEND_URL=http://your-ec2-public-ip
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Step 6: Start Backend with PM2

```bash
cd /home/ubuntu/teecole/backend
pm2 start src/server.js --name teecole-backend
pm2 save
pm2 startup
```

### Step 7: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/teecole
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-ec2-public-ip;  # or your-domain.com

    # Frontend (React build)
    location / {
        root /home/ubuntu/teecole/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Uploaded files
    location /uploads {
        alias /home/ubuntu/teecole/backend/uploads;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/teecole /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 8: Configure Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### Step 9: Access Your Application

Visit: `http://your-ec2-public-ip`

## Option 2: Production Architecture with S3

### Step 1: Create S3 Bucket for Frontend

```bash
# Create bucket
aws s3 mb s3://teecole-frontend

# Enable static website hosting
aws s3 website s3://teecole-frontend --index-document index.html --error-document index.html

# Build and upload frontend
cd frontend
npm run build
aws s3 sync build/ s3://teecole-frontend --acl public-read
```

### Step 2: Create CloudFront Distribution

1. Go to **CloudFront Console**
2. Create distribution with S3 bucket as origin
3. Configure custom domain (optional)
4. Enable HTTPS with ACM certificate

### Step 3: Backend on EC2 (Same as Option 1)

Follow Option 1 steps but only deploy backend

### Step 4: Update CORS

Update backend CORS to allow CloudFront domain:

```javascript
// In backend/src/server.js
const corsOptions = {
  origin: ['https://your-cloudfront-domain.cloudfront.net'],
  credentials: true
};
```

## SSL/HTTPS Configuration

### Using Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Database Backup Strategy

### Automated SQLite Backup

Create backup script:

```bash
nano /home/ubuntu/backup-db.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DB_PATH="/home/ubuntu/teecole/backend/teecole.db"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
sqlite3 $DB_PATH ".backup '$BACKUP_DIR/teecole_backup_$DATE.db'"

# Keep only last 7 days
find $BACKUP_DIR -name "teecole_backup_*.db" -mtime +7 -delete
```

Make executable and schedule:

```bash
chmod +x /home/ubuntu/backup-db.sh
crontab -e
# Add: 0 2 * * * /home/ubuntu/backup-db.sh
```

## Monitoring and Logs

### PM2 Monitoring

```bash
# View logs
pm2 logs teecole-backend

# Monitor processes
pm2 monit

# Restart if needed
pm2 restart teecole-backend
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

## Auto-Deploy with GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to EC2
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.EC2_HOST }}
        username: ubuntu
        key: ${{ secrets.EC2_SSH_KEY }}
        script: |
          cd /home/ubuntu/teecole
          git pull origin main
          cd backend
          npm install
          pm2 restart teecole-backend
          cd ../frontend
          npm install
          npm run build
          sudo systemctl restart nginx
```

Add secrets in GitHub repository settings:
- `EC2_HOST`: Your EC2 public IP
- `EC2_SSH_KEY`: Your private SSH key

## Cost Estimation

### Option 1 (EC2 Only)
- **EC2 t2.small**: ~$17/month
- **Elastic IP**: Free (when attached)
- **Total**: ~$17-20/month

### Option 2 (Production)
- **EC2 t2.small**: ~$17/month
- **S3**: ~$1-5/month
- **CloudFront**: ~$1-10/month
- **Route 53**: ~$0.50/month
- **Total**: ~$20-35/month

## Security Checklist

- [ ] Change default admin credentials
- [ ] Use strong JWT secret
- [ ] Enable HTTPS/SSL
- [ ] Configure security groups properly
- [ ] Set up database backups
- [ ] Enable CloudWatch monitoring
- [ ] Configure log rotation
- [ ] Use environment variables for secrets
- [ ] Enable firewall (UFW)
- [ ] Keep system updated

## Troubleshooting

### Application not accessible
```bash
# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

# Check logs
pm2 logs
sudo tail -f /var/log/nginx/error.log
```

### Database issues
```bash
# Check database file permissions
ls -la /home/ubuntu/teecole/backend/teecole.db
chmod 644 /home/ubuntu/teecole/backend/teecole.db
```

### Port issues
```bash
# Check what's using ports
sudo netstat -tulpn | grep :5001
sudo netstat -tulpn | grep :80
```

## Scaling Options

1. **Vertical Scaling**: Upgrade to larger EC2 instance
2. **Horizontal Scaling**: Add load balancer + multiple EC2 instances
3. **Database**: Migrate to RDS for better performance
4. **Caching**: Add ElastiCache (Redis) for sessions
5. **CDN**: Use CloudFront for global distribution

## Support

For deployment issues or questions:
- AWS Support: https://aws.amazon.com/support/
- Documentation: https://docs.aws.amazon.com/

---

**Ready to deploy?** Start with Option 1 for a quick setup, then migrate to Option 2 as traffic grows.
