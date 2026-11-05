# 🚀 DDUPaperHub Production & Automated CI/CD Guide

This guide walks you through setting up your **Production Server** and enabling **Continuous Deployment (CI/CD)** via GitHub Actions so that whenever you push code or add new features to GitHub, your live production application automatically updates.

---

## 🗄️ Database: Supabase (Managed PostgreSQL)

The production database is **Supabase** — a managed PostgreSQL service with a free tier.
All PDFs are stored in **Cloudflare R2** (S3-compatible object storage), not in the database.

### Get your Supabase connection string

1. Go to https://supabase.com → create a project (free).
2. Open the project → **Settings** → **Database** → **Connection string**.
3. Copy the `jdbc:postgresql://` URL — it contains the user, password, host, port, and database.

⚠️ **Important — split the URL before you use it.** Two things make the app fail to boot:

1. The URL **must start with `jdbc:`** — the driver rejects a bare `postgresql://` URL with:
   ```
   Driver org.postgresql.Driver claims to not accept jdbcUrl, ...
   ```
2. If your password contains an `@` character (e.g. `Hetp@tel9126`), the JDBC driver
   mis-parses the URL (it reads `user:password@host`).

So set the env vars like this:

| Variable | Value |
|---|---|
| `SUPABASE_DB_URL` | `jdbc:postgresql://db.<ref>.supabase.co:5432/postgres` — **host+port+db only, no password, with `jdbc:` prefix** |
| `SUPABASE_DB_USERNAME` | `postgres.<ref>` (the user from the connection string) |
| `SUPABASE_DB_PASSWORD` | the password |

### Environment variables

| Variable | Where it comes from |
|---|---|
| `SUPABASE_DB_URL` | Supabase connection string (full `jdbc:postgresql://` URL) |
| `SUPABASE_DB_USERNAME` | From the connection string |
| `SUPABASE_DB_PASSWORD` | From the connection string |

The backend runs with `SPRING_PROFILES_ACTIVE=supabase`, which reads these variables
from `backend/src/main/resources/application-supabase.yml`.

### Schema

The schema is created once by running `supabase/schema.sql` in the Supabase SQL Editor.
It mirrors the JPA entities exactly, so the app boots with `ddl-auto: update` and no
further migrations are needed.

### Migrating data from the old database

Run `node supabase/migrate.js` with both connection strings:

```bash
RENDER_DB_URL="postgres://..." SUPABASE_DB_URL="postgres://..." node supabase/migrate.js
```

See [Step 3.5](#-step-35-migrate-the-data) below.

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

## ☁️ Step 2: Set Up Supabase (Database)

Supabase is the database for this project. It is free to start and stays cheap.

1. Go to [https://supabase.com](https://supabase.com) and create an account.
2. Create a new project (any name, any region).
3. Wait 2-3 minutes for it to provision.
4. Go to **Settings** → **Database** → **Connection string** and copy the
   `jdbc:postgresql://...` URL.
5. Go to **SQL Editor** and run the contents of `supabase/schema.sql` to create
   the tables.

That's it — the database is ready.

### 2.1 (Optional) Prepare Your Production Server

You can use any Linux VPS (Ubuntu 22.04 / 24.04 recommended):
- **Oracle Cloud Free Tier** (Always Free 4-Core ARM / 24GB RAM or 1GB AMD instance)
- **DigitalOcean** ($4 - $6/month Droplet)
- **AWS EC2** (t4g.small or t3.micro Free Tier)
- **Hetzner** (€4/month Cloud Server)

### 2.2 Install Docker & Git on Server
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

### 2.3 Clone Repository onto Server (First-Time Setup)

```bash
# Clone the repository
git clone https://github.com/<YOUR_GITHUB_USERNAME>/DDUPaperHub.git
cd DDUPaperHub

# Create environment file
cp .env.example .env
nano .env   # Fill in SUPABASE_DB_URL, SUPABASE_DB_USERNAME, SUPABASE_DB_PASSWORD, JWT_SECRET
```

### 2.4 Initial Start

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Your app will be live at `http://<YOUR_SERVER_IP>`!

> **Note:** `docker-compose.prod.yml` now points the backend at Supabase. If you are
> running on Render instead of your own server, use `render.yaml` — it configures
> Supabase as a managed database on Render directly.

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

## 🔄 Step 3.5: Migrate the Data

If you already have data on the old database (Render's managed PostgreSQL), move it
to Supabase before switching the app over.

```bash
# 1. Get the old DB connection string from Render: Dashboard → ddu-paperhub-db → Connection
# 2. Get the Supabase connection string (from Step 2)
# 3. Run the migration
RENDER_DB_URL="postgres://old:pass@old-host:5432/ddu_paperhub" \
SUPABASE_DB_URL="postgres://postgres:pass@aws-0-us-east-1.pooler.supabase.com:6543/ddu_paperhub" \
node supabase/migrate.js
```

The script copies all 7 tables (users, departments, subjects, papers, bookmarks,
reports, audit_logs) in FK-safe order and prints a row-count verification at the end.
It truncates the destination first, so it is safe to re-run.

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

> **Before the first deploy after switching to Supabase:** make sure the Supabase
> tables exist (`supabase/schema.sql`) and the data is migrated (Step 3.5), then set
> the `SUPABASE_DB_*` env vars on the server or in Render. The app will boot with
> `SPRING_PROFILES_ACTIVE=supabase`.

---

## 🔒 Optional: Add Free Domain & SSL (HTTPS)

To serve your site on `https://ddupaperhub.com` with a free SSL certificate:

1. Point your domain's **A Record** to your server's IP address.
2. Install Certbot on the server or point your DNS through **Cloudflare** (Free Universal SSL + CDN caching).
