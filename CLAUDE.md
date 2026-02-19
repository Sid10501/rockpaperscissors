# CLAUDE.md — Multiplayer Rock Paper Scissors

## Project Overview

- **Type:** Full-stack real-time web app
- **Features:** Room-code matchmaking, Play vs AI (Easy/Medium/Hard), global leaderboard (SQLite), emoji reactions, sounds, URL room sharing, toast notifications, connection status
- **Hosting:** Render (server), Vercel (client)

## Tech Stack

- **Frontend:** React 18 + Vite + TypeScript
- **Styling:** TailwindCSS (dark theme)
- **Real-time:** Socket.io v4 (client + server)
- **Backend:** Node.js + Express + TypeScript (`tsx` for dev, `tsc` for build)
- **State:** In-memory Map (rooms); SQLite via `better-sqlite3` (global leaderboard)
- **Hosting:** Render (server), Vercel (client)

## Architecture

```
client/src/
  components/   → NameEntry, RoomScreen, WaitingRoom, ChoiceSelector,
                  Countdown, RevealScreen, Scoreboard, LeaderboardPanel,
                  GameHeader, Toast, ReactionBar
  hooks/        → useSocketStatus
  lib/           → sounds.ts (Web Audio)
  socket.ts      → Socket.io client singleton
  types.ts       → Shared types (mirrored from shared/)

server/
  index.ts       → Express + Socket.io, all events
  roomManager.ts → Room creation/joining, in-memory state
  gameLogic.ts   → Winner determination
  aiOpponent.ts  → AI (random / adaptive / Markov)
  leaderboard.ts → SQLite persistent top 10

shared/
  types.ts       → Choice, GameResultWinner, LeaderboardPlayer, etc.
```

## Coding Rules

- TypeScript strict mode everywhere. No `any`.
- Functional React components with hooks only. No class components.
- Small focused functions — keep under 50 lines where possible.
- Error handling on all async calls and socket events.
- Comment the WHY, not the WHAT.
- Small diffs preferred — don't refactor things we didn't ask to change.
- Add/modify tests for any logic you change (game logic especially).

## Socket.io Events

### Client → Server
| Event | Payload |
|-------|---------|
| `create_room` | `{ playerName: string }` |
| `join_room` | `{ roomCode: string, playerName: string }` |
| `submit_choice` | `{ choice: 'rock' \| 'paper' \| 'scissors' }` |
| `request_rematch` | `{}` |
| `request_leaderboard` | `{}` — server responds with `leaderboard_update` |
| `play_vs_ai` | `{ playerName: string, difficulty: 'random' \| 'adaptive' \| 'hard' }` |
| `send_reaction` | `{ emoji: string }` — allowlist: 😂 🔥 👀 💀 🙏 |

### Server → Client
| Event | Payload |
|-------|---------|
| `room_created` | `{ roomCode?: string, error?: string }` |
| `room_joined` | `{ error?: string }` |
| `game_ready` | `{ opponentName?: string }` |
| `opponent_joined` | `{ opponentName: string }` |
| `waiting_for_opponent` | `{}` |
| `start_countdown` | `{}` |
| `reveal_result` | `{ yourChoice, opponentChoice, winner: 'you' \| 'opponent' \| 'tie' }` |
| `opponent_disconnected` | `{}` |
| `rematch_ready` | `{}` |
| `leaderboard_update` | `{ topPlayers: LeaderboardPlayer[] }` |
| `reaction_received` | `{ emoji: string }` |

## Dev Commands

```bash
# Root
npm run dev          # starts both client and server (concurrently)

# Client (client/)
npm run dev          # Vite dev server on :5173
npm run build        # production build

# Server (server/)
npm run dev          # tsx watch mode on :3001
npm run build        # tsc compile
```

## What to Avoid

- Don't add npm dependencies without asking first.
- Don't delete existing tests.
- Don't commit `.env` files or API keys.
- Don't use `any` type — use proper TypeScript types from `shared/types.ts`.
- Don't use class components in React.
- Don't block the event loop in server code.

## Before Coding

Propose a plan in bullet points and wait for "OK" before implementing.

## Team

- **Lead (sgrover):** Scaffold, server core, game logic, deployment
- **Member 2:** All React UI screens, countdown, ASCII reveal, styling
- **Member 3:** Rematch/disconnect, AI opponent, leaderboard, tournament
