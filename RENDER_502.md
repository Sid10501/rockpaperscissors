# Render 502 Bad Gateway – Checklist

If the frontend gets **502** when hitting `https://rps-server-swf1.onrender.com/socket.io/...`:

1. **Cold start (free tier)**  
   The service sleeps after ~15 min of no traffic. The first request can return 502 for **30–60 seconds** while the instance starts. Wait and retry or open the app again.

2. **Confirm Render settings**  
   In **Dashboard → rps-server → Settings**:
   - **Build Command:** `cd server && npm install && npm run build`
   - **Start Command:** `cd server && npm start`
   - **Root Directory:** leave empty (repo root).

3. **Check logs**  
   **Dashboard → rps-server → Logs**. Look for:
   - `Server listening on http://0.0.0.0:XXXX` → server started.
   - Any stack trace or "Uncaught exception" → fix that error.

4. **CORS**  
   Set **CORS_ORIGIN** to your Vercel URL (e.g. `https://your-app.vercel.app`) so the backend accepts requests from the frontend.

5. **Health check**  
   Open `https://rps-server-swf1.onrender.com/health` in a browser. You should see `{"ok":true}`. If that also returns 502, the process isn’t starting correctly; use the logs from step 3.
