# Bible Juice - Railway Deployment Guide

This guide will help you deploy your Next.js application to Railway so anyone can use it.

## 1. Prepare Your Project for Deployment

### Verify Git Setup
Your project has uncommitted changes. You need to commit these changes and push them to your GitHub repository so Railway can see the latest code.

Run the following commands in your terminal:

```bash
git add .
git commit -m "Prepare for deployment: Finalize features and cleanup"
git push origin main
```

### Check Environment Variables
You will need to add these sensitive keys to your Railway project settings. **Do not simply copy your `.env.local` file to GitHub.**

Gather these values from your local `.env.local` file:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

## 2. Deploy on Railway

1.  **Log in to Railway**: Go to [railway.app](https://railway.app/) and log in with your GitHub account.
2.  **New Project**: Click **"New Project"** -> **"Deploy from GitHub repo"**.
3.  **Select Repository**: Choose your `bible-juice` repository.
4.  **Add Variables**:
    *   Before clicking "Deploy", look for a section to add Environment Variables.
    *   Add each key-value pair listed above.
    *   Alternatively, you can deploy first (it might fail initially), then go to the **"Variables"** tab in your project dashboard and add them there. A redeploy will trigger automatically.

## 3. Verify Deployment

Once the build finishes (usually 2-3 minutes), Railway will provide a public URL (e.g., `bible-juice-production.up.railway.app`).
Click it and test:
- The landing page loads.
- The "About" page works.
- The visitor counter increments.
- A test reflection generates a result.

## Troubleshooting
- If the build fails, check the **Build Logs** in Railway.
- If features don't work, double-check your **Environment Variables** for typos.
