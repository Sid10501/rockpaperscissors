# Rock Paper Scissors — Multiplayer

Real-time multiplayer Rock Paper Scissors with room-code matchmaking, AI opponent, global leaderboard, and optional emoji reactions.

## Features

- **Multiplayer** — Create or join rooms with a 6-character code; play in real time via WebSockets.
- **Play vs AI** — Easy (random), Medium (adaptive), or Hard (Markov-style) difficulty.
- **Global leaderboard** — Persistent top 10 (SQLite), shown on home, room lobby, and after each round; win streaks highlighted.
- **UX** — Connection status indicator, toast notifications, URL room sharing (`?room=CODE`), copy-code feedback, AI rematch handling.
- **Polish** — Web Audio sounds (countdown tick, win/lose/tie), emoji reactions during choice/countdown, round history strip, responsive dark UI (Tailwind).

## Quick start

```bash
npm run install:all
npm run dev
```

- **Client:** http://localhost:5173  
- **Server:** http://localhost:3001  

## Deployment

| Platform | Role | Notes |
|----------|------|--------|
| **Render** | Backend | Use `render.yaml`. Do not set `PORT` in env. Set **CORS_ORIGIN** to your frontend URL. See [RENDER_502.md](RENDER_502.md) if you get 502s or "no open ports". |
| **Vercel** | Frontend | Root Directory = `client`. Set **VITE_SERVER_URL** to your Render backend URL. See [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md). |

## Scripts

| Command | Description |
|--------|--------------|
| `npm run dev` | Run client + server (root) |
| `npm run dev:client` | Client only (:5173) |
| `npm run dev:server` | Server only (:3001) |
| `npm run install:all` | Install root, client, and server deps |

## Documentation

| File | Description |
|------|-------------|
| [CLAUDE.md](CLAUDE.md) | Tech stack, architecture, socket events, coding rules |
| [BUILD_PLAN.md](BUILD_PLAN.md) | Architecture, game flow, task breakdown |
| [CHEATSHEET.md](CHEATSHEET.md) | Technologies and vibe-coding workflow |
| [CHANGELOG.md](CHANGELOG.md) | Feature and fix summary (hackathon / post-MVP) |
| [PR_SUMMARY.md](PR_SUMMARY.md) | PR / final submission checklist and deploy notes |
| [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md) | Step-by-step Vercel deploy |
| [RENDER_502.md](RENDER_502.md) | Backend 502 / port troubleshooting |

## License

See repository license.
