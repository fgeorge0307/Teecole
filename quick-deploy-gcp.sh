#!/bin/bash

# Quick GCP Setup Script
# Creates VM instance and deploys Teecole app

set -e

echo "🚀 Quick GCP Setup for Teecole"
echo "=============================="
echo ""

# Check for gcloud
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Get current project
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)

if [ -z "$PROJECT_ID" ]; then
    echo "❌ No GCP project set. Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "📋 Using GCP Project: $PROJECT_ID"
echo ""

# Configuration
VM_NAME="teecole-server"
ZONE="us-central1-a"
REGION="us-central1"
MACHINE_TYPE="e2-small"

echo "⚙️  Configuration:"
echo "   VM Name: $VM_NAME"
echo "   Zone: $ZONE"
echo "   Machine Type: $MACHINE_TYPE"
echo ""

read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

echo ""
echo "🔧 Step 1: Creating firewall rules..."

# Create firewall rules
gcloud compute firewall-rules create allow-http \
    --project=$PROJECT_ID \
    --allow=tcp:80 \
    --target-tags=http-server \
    --description="Allow HTTP traffic" \
    2>/dev/null || echo "Firewall rule 'allow-http' already exists"

gcloud compute firewall-rules create allow-https \
    --project=$PROJECT_ID \
    --allow=tcp:443 \
    --target-tags=https-server \
    --description="Allow HTTPS traffic" \
    2>/dev/null || echo "Firewall rule 'allow-https' already exists"

echo "✅ Firewall rules configured"

echo ""
echo "🖥️  Step 2: Creating VM instance..."

# Create VM
gcloud compute instances create $VM_NAME \
    --project=$PROJECT_ID \
    --zone=$ZONE \
    --machine-type=$MACHINE_TYPE \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud \
    --boot-disk-size=20GB \
    --boot-disk-type=pd-standard \
    --tags=http-server,https-server \
    --metadata=startup-script='#!/bin/bash
apt-get update
apt-get install -y git' || {
    echo "❌ Failed to create VM. It may already exist."
    echo "To delete and recreate: gcloud compute instances delete $VM_NAME --zone=$ZONE"
    exit 1
}

echo "✅ VM instance created"

echo ""
echo "⏳ Waiting for VM to be ready (30 seconds)..."
sleep 30

echo ""
echo "📍 Step 3: Getting VM IP address..."

VM_IP=$(gcloud compute instances describe $VM_NAME \
    --zone=$ZONE \
    --format="get(networkInterfaces[0].accessConfigs[0].natIP)")

echo "✅ VM IP: $VM_IP"

echo ""
echo "🚀 Step 4: Running deployment script..."
echo ""

# Run deployment
./deploy-gcp.sh $VM_IP $VM_NAME $ZONE

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "📝 Important Information:"
echo "   VM Name: $VM_NAME"
echo "   Zone: $ZONE"
echo "   IP Address: $VM_IP"
echo "   URL: http://$VM_IP"
echo ""
echo "💡 Next Steps:"
echo "   1. Visit: http://$VM_IP"
echo "   2. Login to admin: http://$VM_IP/admin/login"
echo "   3. Credentials: admin / admin123"
echo ""
echo "🔒 Security:"
echo "   - Change admin password immediately"
echo "   - Consider setting up SSL with a domain"
echo ""
echo "📊 Monitoring:"
echo "   - Cloud Console: https://console.cloud.google.com/compute/instances?project=$PROJECT_ID"
echo "   - SSH: gcloud compute ssh $VM_NAME --zone=$ZONE"
echo ""
echo "💰 Cost Management:"
echo "   - Estimated cost: ~$15-20/month"
echo "   - Stop VM when not in use: gcloud compute instances stop $VM_NAME --zone=$ZONE"
echo "   - Start VM: gcloud compute instances start $VM_NAME --zone=$ZONE"
echo ""
