# CI/CD Pipeline Setup Guide

This guide will help you set up automated deployments to Google Cloud Platform using GitHub Actions.

## Overview

The pipeline automatically deploys your app to GCP when you push code to the `main` branch:

1. ✅ Checkout code from GitHub
2. ✅ Install dependencies
3. ✅ Build frontend
4. ✅ Deploy to GCP VM
5. ✅ Restart services
6. ✅ Verify deployment

## Prerequisites

- GitHub repository with admin access
- GCP project with VM running
- Google Cloud Service Account with permissions

## Setup Steps

### Step 1: Create Google Cloud Service Account

1. Go to [GCP Console](https://console.cloud.google.com)
2. Navigate to **IAM & Admin** > **Service Accounts**
3. Click **Create Service Account**
4. Enter details:
   - **Name**: `github-actions-deployer`
   - **Description**: `Service account for GitHub Actions CI/CD`
5. Click **Create and Continue**
6. Grant these roles:
   - `Compute Admin` (for VM management)
   - `Service Account User` (for SSH access)
7. Click **Continue** > **Done**

### Step 2: Create and Download Service Account Key

1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key** > **Create new key**
4. Choose **JSON** format
5. Click **Create** (file will download automatically)
6. **Important**: Keep this file secure and never commit it to Git!

### Step 3: Add GitHub Secret

1. Go to your GitHub repository
2. Click **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add the following secret:

   **Name**: `GCP_SA_KEY`
   
   **Value**: Paste the entire contents of the JSON file you downloaded
   
5. Click **Add secret**

### Step 4: Enable GitHub Actions

1. Go to **Actions** tab in your GitHub repository
2. If prompted, enable GitHub Actions
3. The workflow should now be visible

### Step 5: Configure SSH Access (One-time setup)

Run this on your local machine to add the service account to your VM:

```bash
# Set variables
PROJECT_ID="teecole-477518"
VM_NAME="teecole-server"
ZONE="us-central1-a"
SA_EMAIL="github-actions-deployer@teecole-477518.iam.gserviceaccount.com"

# Add service account to VM metadata
gcloud compute instances add-metadata $VM_NAME \
  --zone=$ZONE \
  --metadata=enable-oslogin=TRUE

# Grant OS Login role
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/compute.osLogin"
```

## How to Use

### Automatic Deployment

Simply push code to the `main` branch:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

The pipeline will automatically:
1. Detect the push
2. Build your application
3. Deploy to GCP
4. Verify the deployment
5. Show status in GitHub Actions

### Manual Deployment

1. Go to **Actions** tab in GitHub
2. Click on **Deploy to GCP** workflow
3. Click **Run workflow**
4. Select `main` branch
5. Click **Run workflow**

## Monitoring Deployments

### View Deployment Logs

1. Go to **Actions** tab
2. Click on the latest workflow run
3. Click on **Deploy to Google Cloud** job
4. Expand steps to see detailed logs

### Check Deployment Status

The pipeline will:
- ✅ Show green checkmark if successful
- ❌ Show red X if failed
- 🟡 Show yellow dot if in progress

### Get Deployment URL

After successful deployment, the logs will show:
```
🎉 Deployment successful!
🌐 Live at: http://35.202.31.94
```

## Troubleshooting

### Problem: "Permission denied" errors

**Solution**: Make sure the service account has the correct roles:
```bash
gcloud projects add-iam-policy-binding teecole-477518 \
  --member="serviceAccount:github-actions-deployer@teecole-477518.iam.gserviceaccount.com" \
  --role="roles/compute.admin"
```

### Problem: "Cannot connect to VM"

**Solution**: Check firewall rules and OS Login:
```bash
# Enable OS Login
gcloud compute instances add-metadata teecole-server \
  --zone=us-central1-a \
  --metadata=enable-oslogin=TRUE
```

### Problem: "Deployment verification failed"

**Solution**: SSH into VM and check services:
```bash
gcloud compute ssh ubuntu@teecole-server --zone=us-central1-a

# Check PM2
pm2 list
pm2 logs teecole-backend

# Check Nginx
sudo systemctl status nginx
sudo nginx -t
```

### Problem: "npm ci failed"

**Solution**: Make sure package-lock.json exists and is committed:
```bash
cd backend
npm install
git add package-lock.json

cd ../frontend
npm install
git add package-lock.json

git commit -m "Add package-lock.json files"
git push origin main
```

## Pipeline Workflow Details

### 1. Build Stage (GitHub Actions Runner)
- Installs Node.js 18
- Installs backend dependencies (`npm ci --omit=dev`)
- Installs frontend dependencies (`npm ci`)
- Builds frontend production bundle

### 2. Deploy Stage (GCP VM)
- Creates deployment package (tar.gz)
- Uploads to VM via `gcloud compute scp`
- Extracts and copies files
- Installs dependencies on VM
- Restarts PM2 service

### 3. Verify Stage
- Waits 10 seconds for services to start
- Sends HTTP request to VM
- Checks for 200 OK response
- Reports success/failure

## Security Best Practices

✅ **DO:**
- Keep service account JSON key secure
- Use GitHub Secrets for credentials
- Regularly rotate service account keys
- Use least privilege IAM roles
- Enable OS Login on VMs

❌ **DON'T:**
- Commit service account keys to Git
- Share secrets publicly
- Grant excessive permissions
- Disable security features

## Cost Considerations

GitHub Actions provides:
- **2,000 minutes/month** free for private repos
- **Unlimited minutes** for public repos

This pipeline uses approximately:
- **3-5 minutes** per deployment
- ~400-600 deployments/month on free tier

## Advanced Configuration

### Deploy to Multiple Environments

Create separate workflow files:

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging
on:
  push:
    branches: [develop]
env:
  VM_NAME: teecole-staging
```

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production
on:
  push:
    branches: [main]
env:
  VM_NAME: teecole-server
```

### Add Slack Notifications

Add this step to your workflow:

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Add Database Migrations

Add this step before restarting PM2:

```yaml
- name: Run migrations
  run: |
    gcloud compute ssh ubuntu@$VM_NAME \
      --zone=$ZONE \
      --command="cd /home/ubuntu/teecole/backend && npm run migrate"
```

## Manual Rollback

If you need to rollback to a previous version:

```bash
# SSH into VM
gcloud compute ssh ubuntu@teecole-server --zone=us-central1-a

# Check PM2 logs
pm2 logs teecole-backend

# If needed, manually deploy a previous commit
cd /home/ubuntu/teecole
git log --oneline  # Find commit hash
git checkout <commit-hash>
cd backend && npm install
cd ../frontend && npm install && npm run build
pm2 restart teecole-backend
```

## Support

For issues with the pipeline:
1. Check GitHub Actions logs
2. Check VM logs: `pm2 logs teecole-backend`
3. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
4. Review this guide's troubleshooting section

## Next Steps

After setup:
1. ✅ Test the pipeline with a small change
2. ✅ Set up staging environment (optional)
3. ✅ Add automated tests before deployment
4. ✅ Configure monitoring and alerts
5. ✅ Document your deployment process

---

**Pipeline Status**: Check the badge in your README
```markdown
![Deploy to GCP](https://github.com/fgeorge0307/teecole/actions/workflows/deploy.yml/badge.svg)
```
