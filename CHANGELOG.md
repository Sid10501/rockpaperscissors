# Changelog

## Summary (Hackathon / Post-MVP)

### Features
- **Global leaderboard** — SQLite-backed top 10; requestable via `request_leaderboard`; shown on NameEntry, RoomScreen, and RevealScreen; win streaks displayed.
- **Play vs AI** — Easy (random), Medium (adaptive), Hard (Markov); difficulty picker before starting.
- **Emoji reactions** — Send 😂 🔥 👀 💀 🙏 during choice/countdown; float-up animation on opponent’s screen.
- **Sounds** — Web Audio: countdown tick, win/lose/tie fanfare on reveal.
- **URL room sharing** — `?room=CODE` in URL; pre-fill join code on load; push code to URL when room is created.
- **Connection status** — Green/amber/red dot; socket connect/disconnect/error handling.
- **Toasts** — Lightweight stack (e.g. "Opponent disconnected", "Copied!").
- **Reveal screen** — Emoji-only choice display; round history strip (last 5); rematch state and AI "Play again" handling.
- **Choice selector** — Selected choice highlighted (ring); others dimmed.
- **Waiting room** — `opponent_disconnected` handler; copy feedback ("Copied!" for 1.5s).
- **Render/Vercel** — PORT validation, 0.0.0.0 listen, deploy docs (VERCEL_DEPLOY, RENDER_502), client `vercel.json` and `VITE_SERVER_URL` handling.

### Docs
- **README** — Feature list, deployment table, doc index.
- **CLAUDE.md** — Updated stack, architecture, socket events (including `request_leaderboard`, `send_reaction`).
- **CHEATSHEET.md** — Tech stack and vibe-coding workflow.
- **VERCEL_DEPLOY.md**, **RENDER_502.md** — Deploy and troubleshooting.

### Fixes
- RevealScreen rematch messaging (no static "Waiting…" before click; AI flow).
- Socket status hook and error handlers.
- Render build: `@types` in dependencies for production install; health handler typed.
- Render deploy: PORT must be numeric (validate and fallback); do not set PORT in env.

---

For full architecture and socket contract, see [CLAUDE.md](CLAUDE.md) and [BUILD_PLAN.md](BUILD_PLAN.md).
