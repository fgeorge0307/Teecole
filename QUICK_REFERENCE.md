# 🚀 Quick Deployment Reference

## 📋 Current Setup

**Live Site**: http://35.202.31.94
**Admin Panel**: http://35.202.31.94/admin/login
**Credentials**: admin / admin123

## 🔄 CI/CD Pipeline Status

✅ **Pipeline Created**: GitHub Actions workflow configured
⏳ **Activation Needed**: Setup GCP service account credentials

## ⚡ Quick Commands

### Deploy Now (Manual)
```bash
cd "/Users/georgefelix/StudioProjects 2/teecole"
git add .
git commit -m "Your changes"
git push origin main
```

### SSH to Server
```bash
gcloud compute ssh teecole-server --zone=us-central1-a
```

### Check Server Status
```bash
gcloud compute ssh ubuntu@teecole-server --zone=us-central1-a --command="pm2 list"
```

### View Backend Logs
```bash
gcloud compute ssh ubuntu@teecole-server --zone=us-central1-a --command="pm2 logs teecole-backend --lines 50"
```

### Restart Backend
```bash
gcloud compute ssh ubuntu@teecole-server --zone=us-central1-a --command="pm2 restart teecole-backend"
```

### Check Website Status
```bash
curl -I http://35.202.31.94
```

## 🔑 Enable Automated Pipeline (One-Time Setup)

### Step 1: Create Service Account
```bash
gcloud iam service-accounts create github-actions-deployer \
    --display-name="GitHub Actions Deployer" \
    --project=teecole-477518
```

### Step 2: Grant Permissions
```bash
gcloud projects add-iam-policy-binding teecole-477518 \
    --member="serviceAccount:github-actions-deployer@teecole-477518.iam.gserviceaccount.com" \
    --role="roles/compute.admin"

gcloud projects add-iam-policy-binding teecole-477518 \
    --member="serviceAccount:github-actions-deployer@teecole-477518.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"
```

### Step 3: Create Key
```bash
gcloud iam service-accounts keys create ~/gcp-key.json \
    --iam-account=github-actions-deployer@teecole-477518.iam.gserviceaccount.com
```

### Step 4: Add to GitHub
1. Copy key content: `cat ~/gcp-key.json | pbcopy`
2. Go to: https://github.com/fgeorge0307/teecole/settings/secrets/actions
3. Click "New repository secret"
4. Name: `GCP_SA_KEY`
5. Paste the JSON content
6. Click "Add secret"

### Step 5: Enable OS Login
```bash
gcloud compute instances add-metadata teecole-server \
    --zone=us-central1-a \
    --metadata=enable-oslogin=TRUE

gcloud projects add-iam-policy-binding teecole-477518 \
    --member="serviceAccount:github-actions-deployer@teecole-477518.iam.gserviceaccount.com" \
    --role="roles/compute.osLogin"
```

### Step 6: Test Pipeline
```bash
# Make a small change
echo "# Test" >> README.md
git add README.md
git commit -m "Test CI/CD pipeline"
git push origin main

# Watch at: https://github.com/fgeorge0307/teecole/actions
```

## 📊 VM Management

### Start VM (if stopped)
```bash
gcloud compute instances start teecole-server --zone=us-central1-a
```

### Stop VM (save costs)
```bash
gcloud compute instances stop teecole-server --zone=us-central1-a
```

### Check VM Status
```bash
gcloud compute instances describe teecole-server --zone=us-central1-a
```

### Get VM IP
```bash
gcloud compute instances describe teecole-server \
    --zone=us-central1-a \
    --format="get(networkInterfaces[0].accessConfigs[0].natIP)"
```

## 🛠️ Troubleshooting

### Website not loading
```bash
# Check backend
gcloud compute ssh ubuntu@teecole-server --zone=us-central1-a --command="pm2 list"

# Check nginx
gcloud compute ssh ubuntu@teecole-server --zone=us-central1-a --command="sudo systemctl status nginx"

# Restart services
gcloud compute ssh ubuntu@teecole-server --zone=us-central1-a --command="pm2 restart all && sudo systemctl restart nginx"
```

### Database issues
```bash
# SSH into server
gcloud compute ssh ubuntu@teecole-server --zone=us-central1-a

# Check database
cd /home/ubuntu/teecole/backend
ls -la teecole.db

# Reset database (WARNING: deletes all data)
rm teecole.db
pm2 restart teecole-backend
```

### Pipeline failing
1. Check logs: https://github.com/fgeorge0307/teecole/actions
2. Verify GCP_SA_KEY secret exists
3. Check service account permissions
4. Ensure VM is running

## 📁 Important Files

```
.github/workflows/deploy.yml          # Main CI/CD pipeline
.github/workflows/deploy-simple.yml   # Alternative git-pull pipeline
CICD_SETUP.md                         # Detailed setup guide
GCP_DEPLOYMENT.md                     # GCP deployment manual
complete-gcp-setup.sh                 # Full VM setup script
deploy-gcp.sh                         # Manual deploy script
```

## 🔐 Security Checklist

- [ ] Change admin password from default
- [ ] Configure email SMTP credentials
- [ ] Add GitHub secret GCP_SA_KEY
- [ ] Enable OS Login on VM
- [ ] Keep service account key secure
- [ ] Regular backup database
- [ ] Monitor deployment logs

## 💰 Cost Tracking

**Current Setup**:
- e2-small VM: ~$13/month
- Storage (20GB): ~$0.80/month
- Static IP: Free (when attached)
- **Total**: ~$15-20/month

**Save Costs**:
```bash
# Stop VM when not needed
gcloud compute instances stop teecole-server --zone=us-central1-a

# Start when needed
gcloud compute instances start teecole-server --zone=us-central1-a
```

## 📞 Support Resources

- **CI/CD Guide**: [CICD_SETUP.md](./CICD_SETUP.md)
- **GCP Guide**: [GCP_DEPLOYMENT.md](./GCP_DEPLOYMENT.md)
- **GitHub Actions**: https://github.com/fgeorge0307/teecole/actions
- **GCP Console**: https://console.cloud.google.com/compute/instances?project=teecole-477518

## ✅ Next Steps

1. **Setup CI/CD** (follow steps above)
2. **Configure Email** in backend/.env
3. **Change Admin Password**
4. **Test Automated Deployment**
5. **Add Custom Domain** (optional)
6. **Setup SSL/HTTPS** (optional)

---

**Quick Access Links**:
- 🌐 Website: http://35.202.31.94
- 👤 Admin: http://35.202.31.94/admin/login
- 📊 Actions: https://github.com/fgeorge0307/teecole/actions
- ☁️ GCP: https://console.cloud.google.com/compute/instances?project=teecole-477518
