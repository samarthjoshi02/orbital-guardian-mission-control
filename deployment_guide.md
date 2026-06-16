# Orbital Guardian - Production Deployment Guide

This guide details the step-by-step procedure to deploy **Orbital Guardian** to production.

```
                  ┌────────────────────────────────┐
                  │       Next.js Frontend         │
                  │          (Vercel)              │
                  └───────────────┬────────────────┘
                                  │
                       HTTPS REST │ Requests
                       (with CORS)│
                                  ▼
                  ┌────────────────────────────────┐
                  │        FastAPI Backend         │
                  │        (Render/Railway)        │
                  └────────────────────────────────┘
```

---

## Step 1: Push Local Changes to GitHub

Ensure all recent configuration changes (including environment variables setup) are committed and pushed to your GitHub repository:

```bash
# Add files to git stage
git add .

# Commit changes
git commit -m "Configure production API endpoints and add deployment guide"

# Push to your main branch
git push origin main
```

---

## Step 2: Deploy the FastAPI Backend to Render

[Render](https://render.com) is recommended for deploying the Python FastAPI backend as a free web service.

1. **Sign In**: Log into your [Render Dashboard](https://dashboard.render.com).
2. **Create Web Service**: Click **New +** and select **Web Service**.
3. **Connect GitHub**: Connect your GitHub account and select the repository `orbital-guardian-mission-control`.
4. **Configure Settings**:
   - **Name**: `orbital-guardian-backend` (or similar)
   - **Environment / Runtime**: `Python 3`
   - **Root Directory**: `backend` *(Crucial: This tells Render to run commands inside the python subfolder)*
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Select Plan**: Select the **Free** instance type.
6. **Deploy**: Click **Deploy Web Service**.
7. **Retrieve Endpoint**: Wait for the build to complete and copy the active web service URL (e.g. `https://orbital-guardian-backend.onrender.com`).

---

## Step 3: Deploy the Next.js Frontend to Vercel

[Vercel](https://vercel.com) is the native hosting platform for Next.js and provides instant builds and serverless optimizations.

1. **Sign In**: Log into your [Vercel Dashboard](https://vercel.com/dashboard).
2. **Add New Project**: Click **Add New** > **Project**.
3. **Import Repository**: Select the `orbital-guardian-mission-control` repository.
4. **Configure Framework & Root**:
   - **Framework Preset**: Next.js (will be detected automatically)
   - **Root Directory**: `./` (Keep it as the project root)
5. **Configure Environment Variables**:
   - Expand the **Environment Variables** section.
   - Add a new environment variable:
     - **Key**: `NEXT_PUBLIC_API_URL`
     - **Value**: Your Render Backend URL with `/api` appended at the end (e.g., `https://orbital-guardian-backend.onrender.com/api`).
6. **Deploy**: Click **Deploy**. Vercel will build your static files, configure the Edge routing, and launch your live sci-fi interface.

---

## Step 4: Verification and Live Testing

Once both systems are deployed:
1. Open your Vercel deployment URL.
2. Check that the space catalog loads, showing the real-time globe visualizer.
3. Open the browser DevTools Console (F12) to verify there are no CORS or connection errors.
4. To test live synchronization:
   - Visually verify that satellites and debris render successfully around the Earth globe.
   - Select any alert in the bottom conjunctions timeline and confirm that AI Recommendations are generated and displayed on the right sidebar.
