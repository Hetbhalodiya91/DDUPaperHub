# 🚀 DDUPaperHub Production & Automated CI/CD Guide

This guide walks you through setting up your **Production Server** and enabling **Continuous Deployment (CI/CD)** via GitHub Actions so that whenever you push code or add new features to GitHub, your live production application automatically updates.

---

## 🏗️ Architecture Overview

```text
[ Developer (Local) ]
       │
       │  git push origin main
       ▼
[ GitHub Repository ]
       │
       ▼  (GitHub Actions CI/CD Triggered)
 ┌──────────────────────────────────────────────┐
 │ 1. Checkout Code                             │
 │ 2. Run Backend Unit & Integration Tests      │
 │ 3. Verify Frontend Production Build          │
 │ 4. SSH into Production Server                │
 └──────────────────────┬───────────────────────┘
                        │
                        ▼  (Automated Deploy over SSH)
           [ Production Cloud Server ]
                        │
                        ├─► git pull origin main
                        └─► docker compose -f docker-compose.prod.yml up -d --build
```

---

## 📋 Step 1: Push Code to GitHub

If you haven't pushed your local project to GitHub yet, run these commands:

```bash
git add .
git commit -m "feat: complete production-ready fullstack app with CI/CD"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/DDUPaperHub.git
git push -u origin main
```

---

## 🖥️ Step 2: Prepare Your Production Server

You can use any Linux VPS (Ubuntu 22.04 / 24.04 recommended):
- **Free / Cheap Options**:
  - **Oracle Cloud Free Tier** (Always Free 4-Core ARM / 24GB RAM or 1GB AMD instance)
  - **DigitalOcean** ($4 - $6/month Droplet)
  - **AWS EC2** (t4g.small or t3.micro Free Tier)
  - **Hetzner** (€4/month Cloud Server)

### 2.1 Install Docker & Git on Server
SSH into your server and run:

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify Docker
docker --version
docker compose version
```

### 2.2 Clone Repository onto Server (First-Time Setup)

```bash
# Clone the repository
git clone https://github.com/<YOUR_GITHUB_USERNAME>/DDUPaperHub.git
cd DDUPaperHub

# Create production environment file
cp .env.example .env
nano .env   # Fill in a strong POSTGRES_PASSWORD and random JWT_SECRET
```

### 2.3 Initial Start

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Your app will be live at `http://<YOUR_SERVER_IP>`!

---

## ⚡ Step 3: Configure Automated Deployment in GitHub

Now connect GitHub Actions to your server so that **every push to `main` automatically deploys**:

1. Generate an SSH key pair on your server (or on your computer):
   ```bash
   ssh-keygen -t ed25519 -C "github-actions-deploy"
   ```
   - Press Enter to accept defaults.
   - Add the public key (`~/.ssh/id_ed25519.pub`) to `~/.ssh/authorized_keys` on your server:
     ```bash
     cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
     ```
   - Copy the private key (`~/.ssh/id_ed25519`):
     ```bash
     cat ~/.ssh/id_ed25519
     ```

2. Open your GitHub Repository in your browser:
   - Go to **Settings** → **Secrets and variables** → **Actions**.
   - Click **New repository secret** and add the following 3 secrets:

| Secret Name | Value | Description |
|---|---|---|
| `SERVER_HOST` | `123.45.67.89` | Your server's public IP address |
| `SERVER_USER` | `ubuntu` (or `root`) | The SSH username for your server |
| `SERVER_SSH_KEY` | `-----BEGIN OPENSSH PRIVATE KEY...` | The entire private key from step 1 |
| `SERVER_PORT` | `22` *(Optional)* | Custom SSH port if not default 22 |

---

## 🚀 Step 4: Test Automatic Deployment!

Now, whenever you update any code locally:
```bash
git add .
git commit -m "Update exam timetable or new feature"
git push origin main
```

1. GitHub will automatically trigger the workflow in `.github/workflows/deploy.yml`.
2. It runs all Java tests and frontend build checks.
3. Once passed, it SSHs into your server, pulls the commit, and rebuilds the containers without downtime!
4. You can monitor the live progress in your GitHub repo under the **Actions** tab.

---

## 🔒 Optional: Add Free Domain & SSL (HTTPS)

To serve your site on `https://ddupaperhub.com` with a free SSL certificate:

1. Point your domain's **A Record** to your server's IP address.
2. Install Certbot on the server or point your DNS through **Cloudflare** (Free Universal SSL + CDN caching).
