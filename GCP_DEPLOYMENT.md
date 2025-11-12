# Google Cloud Platform Deployment Guide

Complete guide to deploy Teecole Limited website to Google Cloud Platform.

## Deployment Architecture Options

### Option 1: Compute Engine (VM) - Recommended for Start
- **Compute Engine VM**: Host both frontend and backend
- **SQLite**: Keep local database
- **Static IP**: Reserved external IP address
- **Firewall Rules**: Configure VPC firewall

### Option 2: App Engine - Fully Managed
- **App Engine**: Automatic scaling and management
- **Cloud SQL**: Managed PostgreSQL database
- **Cloud Storage**: Static assets and uploads

### Option 3: Cloud Run - Serverless Containers
- **Cloud Run**: Container-based serverless
- **Cloud SQL**: Managed database
- **Cloud Storage**: File storage

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **gcloud CLI** installed
3. **Project created** in GCP Console
4. **Domain name** (optional)

## Install gcloud CLI

```bash
# macOS
brew install google-cloud-sdk

# Or download from: https://cloud.google.com/sdk/docs/install

# Initialize gcloud
gcloud init

# Login
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID
```

## Option 1: Compute Engine Deployment (Recommended)

### Step 1: Create VM Instance

```bash
# Set variables
export PROJECT_ID="your-project-id"
export VM_NAME="teecole-server"
export ZONE="us-central1-a"

# Create VM instance
gcloud compute instances create $VM_NAME \
    --project=$PROJECT_ID \
    --zone=$ZONE \
    --machine-type=e2-small \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud \
    --boot-disk-size=20GB \
    --boot-disk-type=pd-standard \
    --tags=http-server,https-server \
    --metadata=startup-script='#!/bin/bash
        apt-get update
        apt-get install -y git'

# Create firewall rules
gcloud compute firewall-rules create allow-http \
    --project=$PROJECT_ID \
    --allow=tcp:80 \
    --target-tags=http-server

gcloud compute firewall-rules create allow-https \
    --project=$PROJECT_ID \
    --allow=tcp:443 \
    --target-tags=https-server

# Reserve static IP
gcloud compute addresses create teecole-ip \
    --project=$PROJECT_ID \
    --region=us-central1

# Get the static IP
gcloud compute addresses describe teecole-ip \
    --region=us-central1 \
    --format="get(address)"
```

### Step 2: Connect to VM

```bash
# SSH into VM
gcloud compute ssh $VM_NAME --zone=$ZONE

# Or use the deployment script (see below)
```

### Step 3: Run Deployment Script

On your local machine:

```bash
# Get VM external IP
VM_IP=$(gcloud compute instances describe $VM_NAME \
    --zone=$ZONE \
    --format="get(networkInterfaces[0].accessConfigs[0].natIP)")

# Deploy using the automated script
./deploy-gcp.sh $VM_IP
```

## Option 2: App Engine Deployment

### Step 1: Prepare App Engine Configuration

Backend `app.yaml` is already created (see below).

### Step 2: Deploy Backend

```bash
cd backend

# Deploy to App Engine
gcloud app deploy app.yaml --project=$PROJECT_ID

# View logs
gcloud app logs tail -s default
```

### Step 3: Deploy Frontend to Cloud Storage + Cloud CDN

```bash
cd frontend

# Build frontend
npm run build

# Create bucket
gsutil mb -p $PROJECT_ID gs://teecole-frontend

# Upload build
gsutil -m cp -r build/* gs://teecole-frontend/

# Make bucket public
gsutil iam ch allUsers:objectViewer gs://teecole-frontend

# Enable Cloud CDN
gcloud compute backend-buckets create teecole-backend-bucket \
    --gcs-bucket-name=teecole-frontend \
    --enable-cdn
```

## Option 3: Cloud Run Deployment

### Step 1: Build and Push Docker Image

```bash
# Build image
docker build -t gcr.io/$PROJECT_ID/teecole-backend ./backend

# Push to Container Registry
docker push gcr.io/$PROJECT_ID/teecole-backend

# Deploy to Cloud Run
gcloud run deploy teecole-backend \
    --image gcr.io/$PROJECT_ID/teecole-backend \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 5001 \
    --memory 512Mi
```

### Step 2: Deploy Frontend

```bash
# Build frontend with Cloud Run backend URL
cd frontend
REACT_APP_API_URL=https://YOUR_CLOUD_RUN_URL npm run build

# Deploy to Firebase Hosting or Cloud Storage
```

## Database Options

### Option A: Keep SQLite (Simple)
- Good for small to medium traffic
- Already configured
- Free

### Option B: Cloud SQL (Production)

```bash
# Create Cloud SQL instance
gcloud sql instances create teecole-db \
    --database-version=POSTGRES_14 \
    --tier=db-f1-micro \
    --region=us-central1

# Create database
gcloud sql databases create teecole \
    --instance=teecole-db

# Create user
gcloud sql users create teecole-user \
    --instance=teecole-db \
    --password=YOUR_PASSWORD
```

## SSL/HTTPS Configuration

### Using Google-managed SSL Certificate

```bash
# Reserve IP address
gcloud compute addresses create teecole-ip \
    --global

# Create SSL certificate
gcloud compute ssl-certificates create teecole-ssl \
    --domains=yourdomain.com,www.yourdomain.com \
    --global

# Create load balancer
gcloud compute url-maps create teecole-lb \
    --default-service teecole-backend-service

# Create HTTPS proxy
gcloud compute target-https-proxies create teecole-https-proxy \
    --ssl-certificates=teecole-ssl \
    --url-map=teecole-lb
```

## Monitoring and Logging

### Enable Cloud Monitoring

```bash
# Install monitoring agent on VM
curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh
sudo bash add-google-cloud-ops-agent-repo.sh --also-install

# View logs
gcloud logging read "resource.type=gce_instance" --limit 50

# Create uptime check
gcloud monitoring uptime create teecole-uptime \
    --display-name="Teecole Website" \
    --resource-type=uptime-url \
    --monitored-resource=https://yourdomain.com
```

## Automated Backup

### Cloud Storage Backup

```bash
# Create backup bucket
gsutil mb -p $PROJECT_ID gs://teecole-backups

# On VM, create backup script
cat > /home/ubuntu/backup-to-gcs.sh << 'EOF'
#!/bin/bash
BACKUP_FILE="teecole_backup_$(date +%Y%m%d_%H%M%S).db"
DB_PATH="/home/ubuntu/teecole/backend/teecole.db"

# Backup database
sqlite3 $DB_PATH ".backup '/tmp/$BACKUP_FILE'"

# Upload to Cloud Storage
gsutil cp /tmp/$BACKUP_FILE gs://teecole-backups/

# Cleanup local backup
rm /tmp/$BACKUP_FILE

# Delete old backups (keep last 30 days)
gsutil ls -l gs://teecole-backups/ | \
    awk '{print $3}' | \
    grep -v TOTAL | \
    while read file; do
        days_old=$(( ($(date +%s) - $(date -d "$(echo $file | cut -d_ -f2)" +%s)) / 86400 ))
        if [ $days_old -gt 30 ]; then
            gsutil rm $file
        fi
    done
EOF

chmod +x /home/ubuntu/backup-to-gcs.sh

# Schedule with cron
(crontab -l 2>/dev/null; echo "0 2 * * * /home/ubuntu/backup-to-gcs.sh") | crontab -
```

## Cost Estimation

### Option 1: Compute Engine
- **e2-small VM**: ~$13/month
- **20GB Storage**: ~$0.80/month
- **Static IP**: Free (when attached)
- **Egress**: Pay as you go
- **Total**: ~$15-20/month

### Option 2: App Engine
- **Standard Environment**: ~$20-50/month
- **Cloud SQL (f1-micro)**: ~$7/month
- **Cloud Storage**: ~$1/month
- **Total**: ~$30-60/month

### Option 3: Cloud Run
- **Cloud Run**: Pay per use (~$5-20/month)
- **Container Registry**: ~$1/month
- **Cloud Storage**: ~$1/month
- **Total**: ~$10-25/month

## CI/CD with Cloud Build

### Create cloudbuild.yaml

```yaml
steps:
  # Install dependencies
  - name: 'node:18'
    entrypoint: npm
    args: ['install']
    dir: 'backend'
  
  - name: 'node:18'
    entrypoint: npm
    args: ['install']
    dir: 'frontend'
  
  # Build frontend
  - name: 'node:18'
    entrypoint: npm
    args: ['run', 'build']
    dir: 'frontend'
  
  # Deploy to VM
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - compute
      - ssh
      - teecole-server
      - --zone=us-central1-a
      - --command=
      - |
        cd /home/ubuntu/teecole
        git pull origin main
        cd backend && npm install --production
        pm2 restart teecole-backend
        cd ../frontend && npm install && npm run build
        sudo systemctl restart nginx
```

### Trigger builds on push

```bash
# Connect repository
gcloud builds triggers create github \
    --repo-name=teecole \
    --repo-owner=fgeorge0307 \
    --branch-pattern="^main$" \
    --build-config=cloudbuild.yaml
```

## Domain Configuration

### Point domain to GCP

1. **Get your static IP:**
```bash
gcloud compute addresses describe teecole-ip \
    --region=us-central1 \
    --format="get(address)"
```

2. **Add DNS records:**
   - A record: `@` → `YOUR_STATIC_IP`
   - A record: `www` → `YOUR_STATIC_IP`

3. **Update Nginx config** with your domain name

## Security Best Practices

- ✅ Use Google-managed SSL certificates
- ✅ Enable Cloud Armor for DDoS protection
- ✅ Configure VPC firewall rules
- ✅ Use Secret Manager for sensitive data
- ✅ Enable Cloud Audit Logs
- ✅ Set up Cloud IAM properly
- ✅ Regular security scanning
- ✅ Enable 2FA on GCP account

## Troubleshooting

### View VM logs
```bash
gcloud compute instances get-serial-port-output $VM_NAME --zone=$ZONE
```

### SSH into VM
```bash
gcloud compute ssh $VM_NAME --zone=$ZONE
```

### Check firewall rules
```bash
gcloud compute firewall-rules list
```

### View application logs
```bash
gcloud logging read "resource.type=gce_instance AND resource.labels.instance_id=$VM_NAME"
```

## Scaling Options

### Vertical Scaling
```bash
# Resize VM
gcloud compute instances set-machine-type $VM_NAME \
    --zone=$ZONE \
    --machine-type=e2-medium
```

### Horizontal Scaling
1. Create instance template
2. Set up managed instance group
3. Configure load balancer
4. Enable autoscaling

### Database Scaling
- Upgrade Cloud SQL tier
- Enable read replicas
- Use connection pooling

## Useful Commands

```bash
# Start VM
gcloud compute instances start $VM_NAME --zone=$ZONE

# Stop VM
gcloud compute instances stop $VM_NAME --zone=$ZONE

# SSH to VM
gcloud compute ssh $VM_NAME --zone=$ZONE

# View logs
gcloud logging read "resource.type=gce_instance" --limit 50

# Get VM external IP
gcloud compute instances describe $VM_NAME \
    --zone=$ZONE \
    --format="get(networkInterfaces[0].accessConfigs[0].natIP)"

# List all resources
gcloud compute instances list
gcloud compute addresses list
gcloud compute firewall-rules list
```

## Support Resources

- **GCP Console**: https://console.cloud.google.com
- **Documentation**: https://cloud.google.com/docs
- **Support**: https://cloud.google.com/support
- **Pricing Calculator**: https://cloud.google.com/products/calculator

## Quick Deploy Checklist

- [ ] Install gcloud CLI
- [ ] Create GCP project
- [ ] Enable billing
- [ ] Create VM instance
- [ ] Configure firewall rules
- [ ] Reserve static IP
- [ ] Run deployment script
- [ ] Configure domain (optional)
- [ ] Set up SSL certificate
- [ ] Configure backups
- [ ] Set up monitoring
- [ ] Change admin credentials

---

**Ready to deploy to GCP?** Start with Option 1 (Compute Engine) for the easiest setup!
