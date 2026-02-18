# RPS Hackathon — Tech & Vibe Coding Cheatsheet

## Technologies Used

| Layer | Technology | Version / notes |
|-------|------------|------------------|
| **Runtime** | Node.js | 22.x (Render default) |
| **Language** | TypeScript | 5.6 (strict mode, no `any`) |
| **Frontend** | React | 18.x, functional components + hooks only |
| **Build (client)** | Vite | 5.x — dev server, HMR, `vite build` |
| **Styling** | TailwindCSS | 3.x — utility classes, dark theme, PostCSS |
| **Real-time** | Socket.io | 4.x — client + server, WebSockets + fallback |
| **Backend** | Express | 4.x — HTTP + Socket.io mounted on same server |
| **Persistence** | better-sqlite3 | Optional leaderboard (SQLite) |
| **Dev (server)** | tsx | Watch + run TS without pre-compile |
| **Monorepo** | npm workspaces-style | Root `install:all`, `dev` runs client + server with concurrently |

---

## Frameworks & Libraries (Quick Reference)

- **React** — UI only; state via `useState` / `useCallback`, no Redux.
- **Vite** — Frontend bundler; env vars via `import.meta.env.VITE_*`.
- **Tailwind** — All styling; no CSS-in-JS or component lib.
- **Socket.io** — Single `socket` singleton in client; events: `create_room`, `join_room`, `submit_choice`, `reveal_result`, `request_rematch`, etc.
- **Express** — One route: `GET /health`; rest is Socket.io.
- **Shared types** — `shared/types.ts` (Choice, GameResultWinner, etc.); client mirrors in `client/src/types.ts`.

---

## Repo Layout

```
client/          → Vite + React (port 5173)
server/          → Express + Socket.io (port 3001)
shared/          → types.ts (source of truth for types)
render.yaml      → Render deploy config
VERCEL_DEPLOY.md → Frontend deploy (Vercel)
RENDER_502.md    → Backend 502 troubleshooting
CLAUDE.md        → AI context (stack, rules, events)
BUILD_PLAN.md    → Architecture, flow, tasks
```

---

## How We Used Vibe Coding

**Vibe coding** here means **AI-assisted iterative development** with Cursor: ship fast using plans, context docs, and agent mode instead of hand-writing every line.

### 1. **Single source of truth for AI**

- **CLAUDE.md** — Project overview, tech stack, architecture, socket events, coding rules. Kept updated so the AI stays aligned.
- **BUILD_PLAN.md** — Mermaid diagrams, file structure, game flow, task breakdown. Used as the “spec” for implementation.
- **Plan files** (e.g. `rps_hackathon_plan_*.plan.md`) — Step-by-step improvement plans (bugs → UX → “wow”); agent works through todos in order.

### 2. **Structured prompts and plans**

- **Attach the plan** — “Implement the plan as specified, it is attached.” Agent marks todos in progress and completed.
- **Scope in one sentence** — “Fix the Render build,” “Deploy the frontend on Vercel,” “Pull latest and see what needs to be edited.”
- **Reference files** — `@BUILD_PLAN.md`, `@server/index.ts` so the model has exact context.

### 3. **Incremental, small changes**

- **One concern per request** — e.g. “add socket status dot,” “add Toast,” “fix 502.”
- **No big-bang refactors** — Prefer small diffs; only change what’s needed.
- **Fix-forward** — When deploy failed (e.g. Render 502, TS build), we applied targeted fixes (listen on `0.0.0.0`, move `@types` to dependencies, type health handler) and re-deployed.

### 4. **Agent mode workflow**

- **Todo-driven** — “Do NOT create new todos. Mark in progress, complete all.” Agent uses existing todo list and reports when done.
- **Full pass** — “Don’t stop until you have completed all the to-dos.”
- **Push when ready** — “Pull from main, then apply these changes,” “Give me a cheatsheet,” “Push everything.”

### 5. **Docs as API for the AI**

- **VERCEL_DEPLOY.md / RENDER_502.md** — Step-by-step so the AI (or a human) can deploy and debug without guessing.
- **README** — Short; links to BUILD_PLAN, CLAUDE, and deploy docs so the AI knows where to look.
- **.env.example** — Documents `VITE_SERVER_URL`; AI uses it when suggesting env vars for Vercel.

### 6. **Conventions we kept**

- TypeScript strict; no `any`.
- Functional React + hooks only.
- One socket singleton; event names and payloads match CLAUDE.md.
- Small, focused components and functions; comment the “why,” not the “what.”

---

## One-Liner Summary

**Tech:** React + Vite + Tailwind (client), Node + Express + Socket.io + optional SQLite (server), TypeScript everywhere.  
**Vibe coding:** Plans + CLAUDE + BUILD_PLAN as AI context; agent mode and todos for implementation; incremental fixes and deploy docs for shipping.
