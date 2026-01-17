# GitHub Actions CI/CD Setup

This directory contains GitHub Actions workflows for automated deployment.

## Workflows

### `deploy.yml` - Frontend Deployment
Automatically deploys the frontend to your VPS server whenever you push to the `master` branch.

**Triggers:**
- Push to `master` branch
- Manual trigger (workflow_dispatch)

**What it does:**
1. Connects to your VPS via SSH
2. Pulls latest code from GitHub
3. Rebuilds the frontend Docker container
4. Restarts the container
5. Cleans up old Docker images

## Setup Instructions

### 1. Generate SSH Key (if you don't have one)

On your local machine or server:
```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy
```

This creates:
- Private key: `~/.ssh/github_actions_deploy`
- Public key: `~/.ssh/github_actions_deploy.pub`

### 2. Add Public Key to VPS

Copy the public key to your server:
```bash
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub user@your-server-ip
```

Or manually add it:
```bash
# On your VPS
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "YOUR_PUBLIC_KEY_CONTENT" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 3. Configure GitHub Secrets

Go to your GitHub repository:
`https://github.com/EventHorizon6626/FE/settings/secrets/actions`

Click **"New repository secret"** and add these secrets:

| Secret Name | Value | Example |
|-------------|-------|---------|
| `SSH_HOST` | Your server IP or hostname | `123.45.67.89` or `myserver.com` |
| `SSH_USERNAME` | SSH username on server | `ubuntu` or `root` or `trieuvy` |
| `SSH_PRIVATE_KEY` | Content of private key file | Content of `~/.ssh/github_actions_deploy` |
| `SSH_PORT` | SSH port (usually 22) | `22` |
| `DEPLOY_PATH` | Full path to EventHorizon directory on server | `/home/ubuntu/EventHorizon` |

#### How to get SSH_PRIVATE_KEY:
```bash
# On your local machine
cat ~/.ssh/github_actions_deploy
# Copy the ENTIRE output including:
# -----BEGIN OPENSSH PRIVATE KEY-----
# ... key content ...
# -----END OPENSSH PRIVATE KEY-----
```

### 4. Prepare Your VPS

Make sure your server has:
```bash
# Install Docker and Docker Compose (if not already installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose -y

# Add your user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Clone repositories to the DEPLOY_PATH
cd /home/ubuntu  # Or your preferred path
git clone https://github.com/EventHorizon6626/Event-Horizon.git Event-Horizon-AI
git clone https://github.com/EventHorizon6626/FE.git

# Create EventHorizon directory structure
mkdir -p EventHorizon
cd EventHorizon
ln -s /home/ubuntu/Event-Horizon-AI Event-Horizon-AI
ln -s /home/ubuntu/FE FE

# Copy docker-compose.yml and .env files
# (Upload these manually or via git)

# Test Docker Compose
docker-compose up -d --build
```

### 5. Test the Workflow

#### Option A: Push to master
```bash
# Make a small change
echo "# Test CI/CD" >> README.md
git add README.md
git commit -m "Test CI/CD deployment"
git push origin master
```

#### Option B: Manual trigger
1. Go to `https://github.com/EventHorizon6626/FE/actions`
2. Click "Deploy Frontend to VPS" workflow
3. Click "Run workflow"
4. Select branch: `master`
5. Click "Run workflow"

### 6. Monitor Deployment

View deployment logs:
1. Go to `https://github.com/EventHorizon6626/FE/actions`
2. Click on the latest workflow run
3. Click on "Deploy to Production Server" job
4. View real-time logs

### Troubleshooting

**SSH Connection Failed:**
- Verify `SSH_HOST`, `SSH_USERNAME`, `SSH_PORT` are correct
- Ensure private key matches the public key on server
- Check server firewall allows SSH from GitHub IPs

**Git Pull Failed:**
- Make sure FE repo is cloned on server
- Verify server can access GitHub (network/firewall)
- Check git credentials if repo is private

**Docker Command Failed:**
- Ensure user is in `docker` group: `sudo usermod -aG docker $USER`
- Verify docker-compose.yml exists in correct location
- Check Docker is running: `sudo systemctl status docker`

**Permission Denied:**
- Make sure `DEPLOY_PATH` exists and user has write access
- Check file ownership: `ls -la $DEPLOY_PATH`

## Security Best Practices

- ✅ Never commit secrets to git
- ✅ Use GitHub Secrets for sensitive data
- ✅ Use dedicated SSH key for deployments
- ✅ Limit SSH key permissions (read-only where possible)
- ✅ Regularly rotate SSH keys
- ✅ Monitor deployment logs for suspicious activity
- ✅ Use non-root user for deployments when possible

## Additional Workflows (Future)

You can add more workflows:
- **Test on PR**: Run tests before merging
- **Build Check**: Verify build succeeds before deployment
- **Staging Deployment**: Deploy to staging environment first
- **Rollback**: Quick rollback to previous version
