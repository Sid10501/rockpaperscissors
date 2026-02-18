# Rock Paper Scissors — Multiplayer

Real-time multiplayer Rock Paper Scissors: room codes, countdown, ASCII reveal, rematch.

## Quick start

```bash
npm run install:all
npm run dev
```

- Client: http://localhost:5173  
- Server: http://localhost:3001  

## Deployment

- **Server (Render):** Use the included `render.yaml`. Build: `cd server && npm install && npm run build`. Start: `cd server && npm start`. Set **CORS_ORIGIN** to your frontend URL after deploy. See [RENDER_502.md](RENDER_502.md) if you get 502s.
- **Client (Vercel):** Set Root Directory to `client`, add env var **VITE_SERVER_URL** (e.g. `https://rps-server-swf1.onrender.com`). See [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md).
- **WebSockets:** Render and Vercel support WebSockets; no extra config needed.

## Scripts

| Command | Description |
|--------|--------------|
| `npm run dev` | Run client + server (root) |
| `npm run dev:client` | Client only (:5173) |
| `npm run dev:server` | Server only (:3001) |
| `npm run install:all` | Install root, client, and server deps |

## Plan

See [BUILD_PLAN.md](BUILD_PLAN.md) and [CLAUDE.md](CLAUDE.md) for architecture and socket events.
