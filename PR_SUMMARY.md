# PR / Final Submission Summary

Use this for a pull request back to the upstream repo or as a handoff summary.

## What’s in this branch

- **Global leaderboard** — Persistent top 10 (SQLite), visible on home, room lobby, and after rounds; `request_leaderboard` event for on-demand fetch.
- **AI opponent** — Easy / Medium / Hard with difficulty picker; no leaderboard updates for AI games.
- **UX and polish** — Connection status dot, toasts, URL room sharing, copy feedback, emoji reactions, Web Audio sounds, round history strip, RevealScreen emoji-only and rematch/AI handling.
- **Deployment** — Render (server) and Vercel (client) with docs; PORT validation and 0.0.0.0 listen for Render.

## Files to review

| Area | Key files |
|------|-----------|
| **Server** | `server/index.ts` (all socket events, `request_leaderboard`), `server/leaderboard.ts`, `server/package.json` (types in deps for Render) |
| **Client** | `client/src/App.tsx`, `client/src/components/LeaderboardPanel.tsx`, `RevealScreen.tsx`, `RoomScreen.tsx`, `NameEntry.tsx`, `ReactionBar.tsx`, `Toast.tsx`, `client/src/hooks/useSocketStatus.ts`, `client/src/lib/sounds.ts`, `client/src/socket.ts` |
| **Deploy** | `render.yaml`, `client/vercel.json`, `client/.env.example` |
| **Docs** | `README.md`, `CLAUDE.md`, `VERCEL_DEPLOY.md`, `RENDER_502.md`, `CHEATSHEET.md`, `CHANGELOG.md` |

## How to run

```bash
npm run install:all
npm run dev
```

- Client: http://localhost:5173  
- Server: http://localhost:3001  

## Deploy (Render + Vercel)

- **Render:** Build `cd server && npm install && npm run build`, Start `cd server && npm start`. Do **not** set `PORT` in env. Set **CORS_ORIGIN** to frontend URL.
- **Vercel:** Root Directory = `client`. Env: **VITE_SERVER_URL** = backend URL (e.g. `https://rps-server-xxx.onrender.com`).

See [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md) and [RENDER_502.md](RENDER_502.md) for step-by-step and troubleshooting.

## Testing

- Create room → share URL or code → join → play round → see reveal, leaderboard, rematch.
- Play vs AI → pick difficulty → play → rematch ("Play again").
- Open app with `?room=CODE` → enter name → join flow pre-filled.
- Disconnect during wait or game → toast and return to name/room as appropriate.
