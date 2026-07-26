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
   - `PORT=3000` (Render defaults to 10000, but map it accordingly or let Render handle the port)
   - `NODE_ENV=production`
   - `MONGODB_URI=your_mongo_atlas_connection_string`
   - `REDIS_URL=your_render_redis_url`
   - `JWT_SECRET=your_secure_random_string`
   - `PLATFORM_SIGNING_KEY=your_secure_signing_key`
   - `RAFT_INTERNAL_SECRET=your_secure_raft_secret`
6. Add the Firebase service account JSON. Since you can't easily upload a file to Render's environment variables, you have two options:
   - **Option A (Secret File)**: Under Advanced -> Secret Files, add a file named `key.json` and paste the contents of your Firebase service account JSON. Ensure your code points `FIREBASE_CREDENTIALS` to this file path if modified.
   - **Option B (Base64 Env Var)**: Encode your `key.json` to Base64, store it as `FIREBASE_CREDENTIALS_BASE64`, and decode it in `src/index.js` before initialization.
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
