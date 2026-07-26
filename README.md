# Idea Exchange Prototype

Idea Exchange is a modern, blockchain-inspired platform for sharing, versioning, and verifying intellectual property and project ideas.

## Project Structure
- `/client`: React (Vite) frontend application.
- `/server`: Node.js Express backend application.
- `docker-compose.yml` & `nginx.conf`: Infrastructure files for deploying a highly-available backend cluster locally or on a VPS.

## Running Locally

To run the full stack locally, make sure you have your `.env` configured in both `client` and `server`.

### Terminal 1 (Backend)
```bash
cd server
npm install
npm run dev
```

### Terminal 2 (Frontend)
```bash
cd client
npm install
npm run dev
```

## Deployment

For instructions on deploying the application to production environments (like Render and Vercel), see the [Deployment Guide](DEPLOYMENT.md).
