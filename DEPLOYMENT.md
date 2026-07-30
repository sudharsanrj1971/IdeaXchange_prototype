# Deployment Guide (Render / Vercel)

This document provides step-by-step instructions for deploying the **Idea Exchange** prototype for production.

## 1. Deploying the Backend (Render)

We recommend using [Render](https://render.com/) for the Node.js backend due to its excellent support for Docker and managed databases.

### Prerequisites
1. A MongoDB Atlas cluster (or Render Managed PostgreSQL if migrating in the future).
2. A Redis instance (Render offers a managed Redis service).
3. Firebase Admin credentials JSON.

### Steps
1. In the Render Dashboard, click **New +** and select **Web Service**.
2. Connect your GitHub repository.
3. For the runtime, select **Docker**.
4. Set the Root Directory to `server/`.
5. Under Advanced, add the following Environment Variables (matching your local `.env`):
   - `NODE_ENV=production`
   - `MONGODB_URI=your_mongo_atlas_connection_string`
   - `REDIS_URL=your_render_redis_url` (optional — only used for the informational `redis` field on `/api/health`; the app runs fine without it)
   - `JWT_SECRET=your_secure_random_string` (32+ chars)
   - `PLATFORM_SIGNING_KEY=your_secure_signing_key` (32+ chars)
   - `RAFT_INTERNAL_SECRET=your_secure_raft_secret` (16+ chars)
   - `CORS_ORIGIN=https://your-vercel-frontend-url.vercel.app` (comma-separate multiple origins, e.g. to also allow a preview URL)
   - Leave `PORT` unset — Render injects its own and the app reads `process.env.PORT` for it.
6. Add the Firebase service account JSON. The app reads it from a single env var, `FIREBASE_SERVICE_ACCOUNT_BASE64` (see `src/config/firebase.js`):
   - Encode your `key.json` to Base64: `base64 -i key.json | tr -d '\n'` (or `certutil -encode` on Windows).
   - Store the result as the `FIREBASE_SERVICE_ACCOUNT_BASE64` environment variable in Render. No code changes needed — it's decoded automatically at startup.
7. Click **Create Web Service**.

## 2. Deploying the Frontend (Vercel)

We recommend using [Vercel](https://vercel.com/) for the Vite React frontend for optimal performance and edge caching.

### Steps
1. Log in to Vercel and click **Add New...** -> **Project**.
2. Import your GitHub repository.
3. In the Configuration screen:
   - Framework Preset: **Vite**
   - Root Directory: `client/`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Expand **Environment Variables** and add:
   - `VITE_API_URL=https://your-render-backend-url.onrender.com`
5. Click **Deploy**.

## 3. High Availability / Docker Swarm (Optional)

If you are deploying to a self-managed VPS (e.g., AWS EC2, DigitalOcean Droplet), you can use the provided `docker-compose.yml` and `nginx.conf` to spin up a load-balanced cluster.

```bash
docker-compose up -d --build
```

This will start:
- 3 instances of the Node.js backend (`app-node-1`, `app-node-2`, `app-node-3`)
- 1 Redis container
- 1 MongoDB container
- 1 Nginx container load-balancing across the 3 nodes on port 80.

Ensure you map your environment variables appropriately for the containers in the VPS environment.
