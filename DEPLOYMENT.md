# Free Hosting & Deployment Guide for MyBoard ($0 Cost Forever)

This guide walks you through deploying the complete **MyBoard** full-stack web application (Frontend + Backend + PostgreSQL Database + S3 Storage) completely free of charge without requiring a paid subscription.

---

## Architecture at a Glance

| Component | Recommended Free Provider | Free Tier Allowance | Cost |
| :--- | :--- | :--- | :--- |
| **Frontend** | **Vercel** or **Render** | 100 GB bandwidth / month, custom domains, free SSL | **$0** |
| **Backend API** | **Render** (Web Service) | 750 free instance hours / month, automatic HTTPS | **$0** |
| **Database** | **Neon.tech** or **Supabase** | Serverless PostgreSQL (0.5 GB - 1 GB), free forever | **$0** |
| **Storage (S3)** | **Cloudflare R2** | 10 GB storage free/mo, **$0 egress fees**, standard S3 API | **$0** |

---

## Option 1: 1-Click Render Blueprint (Easiest)

Render provides a unified dashboard that hosts the Frontend, Backend, and PostgreSQL database together under one blueprint.

### Step 1: Push Code to GitHub
1. Create a new GitHub repository (e.g., `myboard`).
2. Push this project to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of MyBoard"
   git remote add origin https://github.com/<your-username>/myboard.git
   git push -u origin main
   ```

### Step 2: Deploy on Render
1. Go to [render.com](https://render.com) and sign up for a free account.
2. Click **New +** → **Blueprint**.
3. Select your `myboard` repository.
4. Render will detect `render.yaml` and automatically configure:
   - `myboard-db` (Free PostgreSQL instance)
   - `myboard-api` (Free Python Flask web service)
   - `myboard-app` (Free static frontend with CDN)
5. Click **Apply**.
6. Render deploys everything automatically within ~2 minutes!

---

## Option 2: Best Performance Split (Vercel + Render + Neon.tech)

This combination gives the fastest global latency for video streaming / teaching audiences.

### 1. Free PostgreSQL on Neon.tech (1 Minute)
1. Go to [neon.tech](https://neon.tech) and sign up (free, no credit card needed).
2. Create a new project called `myboard`.
3. Copy your connection string:
   ```text
   postgresql://myboard_owner:password@ep-xyz.us-east-2.aws.neon.tech/myboard?sslmode=require
   ```

### 2. Free Backend on Render
1. Go to [render.com](https://render.com) → **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn run:app`
   - **Instance Type**: `Free`
4. In **Environment Variables**, add:
   - `DATABASE_URL`: *(Paste your Neon connection string)*
   - `SECRET_KEY`: *(Any random string, e.g. `myboard-secret-2026`)*
   - `JWT_SECRET_KEY`: *(Any random string, e.g. `jwt-secret-2026`)*
5. Click **Create Web Service**. Note your backend URL (e.g., `https://myboard-api.onrender.com`).

### 3. Free Frontend on Vercel
1. Go to [vercel.com](https://vercel.com) and sign up with GitHub.
2. Click **Add New...** → **Project** and select your `myboard` repository.
3. Configure settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
4. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://myboard-api.onrender.com/api` *(Your Render backend URL)*
5. Click **Deploy**.
6. Your site is live instantly with global CDN and SSL!

---

## S3-Compatible Storage for $0 (Cloudflare R2)

If you wish to store uploaded lesson assets in the cloud for free:
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **R2 Object Storage**.
2. Create a bucket named `myboard-assets`. (10 GB free forever with $0 egress fees).
3. Under R2 API Tokens, click **Create API Token** with Edit permissions.
4. Add these variables to your Render Backend environment:
   - `AWS_S3_BUCKET`: `myboard-assets`
   - `AWS_ACCESS_KEY_ID`: *(Your Cloudflare R2 Access Key ID)*
   - `AWS_SECRET_ACCESS_KEY`: *(Your Cloudflare R2 Secret Access Key)*
   - `AWS_REGION`: `auto`
   - `AWS_S3_ENDPOINT_URL`: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`

*(Note: If you leave these blank, MyBoard automatically saves uploads to the local filesystem or handles images client-side, requiring $0 setup!)*

---

## Running Locally for Development

### 1. Start the Flask Backend (Port 5000)
```bash
cd backend
python run.py
```
*The backend automatically starts on `http://localhost:5000` with the pre-seeded JavaScript curriculum.*

### 2. Start the React Frontend (Port 5173)
```bash
cd frontend
npm run dev
```
*Open `http://localhost:5173` in your browser. All drawings, code blocks, lesson pages, and YouTube mode are fully interactive.*
