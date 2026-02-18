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

- **Server (Railway / Render):** Set `PORT` in the environment. Deploy the repo; use build command `cd server && npm install` and start `cd server && npm run dev` (or `npm start` after `npm run build`). For Render, you can use the included `render.yaml`.
- **Client:** Set `VITE_SERVER_URL` to your server URL (e.g. `https://your-app.railway.app`) before building. Deploy the `client` folder to Vercel/Netlify, or build and serve `client/dist` from your server.
- **WebSockets:** Ensure your host allows WebSocket connections (Railway and Render do).

## Scripts

| Command | Description |
|--------|--------------|
| `npm run dev` | Run client + server (root) |
| `npm run dev:client` | Client only (:5173) |
| `npm run dev:server` | Server only (:3001) |
| `npm run install:all` | Install root, client, and server deps |

## Plan

See [BUILD_PLAN.md](BUILD_PLAN.md) and [CLAUDE.md](CLAUDE.md) for architecture and socket events.
