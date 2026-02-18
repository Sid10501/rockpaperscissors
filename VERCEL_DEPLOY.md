# Deploy frontend to Vercel

1. **Import the repo** at [vercel.com](https://vercel.com) → Add New → Project → Import your `rockpaperscissors` (or `hackathon`) repo.

2. **Set Root Directory** to `client`  
   (Project Settings → General → Root Directory → `client`).

3. **Build settings** (usually auto-detected for Vite):
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Environment variable** (required for production):
   - Name: `VITE_SERVER_URL`
   - Value: `https://rps-server-swf1.onrender.com`
   - Add for Production (and Preview if you want).

5. **Deploy** – Vercel will build and deploy. After deploy, in Render set **CORS_ORIGIN** to your Vercel URL (e.g. `https://your-app.vercel.app`) so the backend accepts requests from the frontend.
