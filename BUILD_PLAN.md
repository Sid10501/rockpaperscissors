---
name: Multiplayer RPS Game
overview: Build a full-stack multiplayer Rock Paper Scissors game using React, Node.js, and Socket.io with text-based ASCII graphics, room code matchmaking, animated countdowns, and per-session score tracking.
todos:
  - id: scaffold
    content: Scaffold Vite React client, Node.js server, and shared types with Socket.io connected end-to-end
    status: pending
  - id: room-management
    content: Implement room creation and joining with 6-character room codes in roomManager.ts
    status: pending
  - id: name-room-screens
    content: Build NameEntry and RoomScreen components (create/join UI)
    status: pending
  - id: waiting-room
    content: Build WaitingRoom component and opponent_joined/game_ready socket events
    status: pending
  - id: choice-selector
    content: Build ChoiceSelector component with hidden R/P/S buttons and submit_choice event
    status: pending
  - id: countdown
    content: Build Countdown component with timed 'Rock... Paper... Scissors... SHOOT!' text animation
    status: pending
  - id: ascii-reveal
    content: Build RevealScreen with ASCII art hands and result display
    status: pending
  - id: winner-scoreboard
    content: Implement game logic (winner determination) and Scoreboard component
    status: pending
  - id: rematch-disconnect
    content: Implement rematch flow and opponent disconnection handling
    status: pending
  - id: polish
    content: Mobile layout polish, copy-to-clipboard room code, TailwindCSS styling pass
    status: pending
---

# Multiplayer Rock Paper Scissors — Build Plan

## Architecture

```mermaid
flowchart TD
    clientA["Client A (Browser)"] -->|"Socket.io"| server["Node.js + Express + Socket.io"]
    clientB["Client B (Browser)"] -->|"Socket.io"| server
    server --> roomManager["Room Manager\n(in-memory Map)"]
    roomManager --> gameLogic["Game Logic\n(determine winner)"]
```

## Project Structure

```
rockpaperscissors/
├── client/                   # React + Vite (TypeScript)
│   └── src/
│       ├── components/
│       │   ├── NameEntry.tsx         # Player name input screen
│       │   ├── RoomScreen.tsx        # Create/join room with code
│       │   ├── WaitingRoom.tsx       # Waiting for opponent
│       │   ├── ChoiceSelector.tsx    # Hidden R/P/S buttons
│       │   ├── Countdown.tsx         # "Rock... Paper... Scissors... SHOOT!"
│       │   ├── RevealScreen.tsx      # ASCII art reveal + result
│       │   └── Scoreboard.tsx        # Win/loss/tie counters
│       ├── socket.ts                 # Socket.io client singleton
│       └── types.ts                  # Shared game types (mirrored)
├── server/
│   ├── index.ts                      # Express + Socket.io setup
│   ├── roomManager.ts                # Room creation, joining, state
│   └── gameLogic.ts                  # Winner determination
└── shared/
    └── types.ts                      # Choice, GameState, RoomState types
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript |
| Styling | TailwindCSS |
| Animation | CSS transitions (text-based countdown) |
| Real-time | Socket.io v4 |
| Backend | Node.js + Express + TypeScript |
| State | In-memory Map (no DB needed for MVP) |
| Hosting | Railway or Render (WebSocket support) |

## Game Flow

```mermaid
sequenceDiagram
    participant A as Player A
    participant S as Server
    participant B as Player B

    A->>S: createRoom(name)
    S-->>A: roomCode "SHARK-42"
    B->>S: joinRoom(code, name)
    S-->>A: opponentJoined
    S-->>B: gameReady
    Note over A,B: Both see ChoiceSelector (choices hidden from each other)
    A->>S: submitChoice("rock")
    S-->>A: waitingForOpponent
    B->>S: submitChoice("scissors")
    S-->>A: startCountdown
    S-->>B: startCountdown
    Note over A,B: "Rock... Paper... Scissors... SHOOT!"
    S-->>A: revealResult(choices, winner)
    S-->>B: revealResult(choices, winner)
    Note over A,B: Scoreboard updates, Rematch offered
```

## Text-Based ASCII Graphics

Choices displayed as large ASCII art on reveal:

```
    ROCK          PAPER         SCISSORS
    _____         _____           __
---'   __\       |     |         |  |-----.
      (    )     |     |         |  |      \
      (    )     |     |         |  |-------|
      (    )     |_____|         |__|
---.__(___)
```

Countdown uses large spaced text rendered character-by-character with a timed delay between "Rock...", "Paper...", "Scissors...", "SHOOT!".

## Socket.io Events

| Event (Client → Server) | Payload |
|---|---|
| `create_room` | `{ playerName }` |
| `join_room` | `{ roomCode, playerName }` |
| `submit_choice` | `{ choice: "rock" \| "paper" \| "scissors" }` |
| `request_rematch` | `{}` |

| Event (Server → Client) | Payload |
|---|---|
| `room_created` | `{ roomCode }` |
| `opponent_joined` | `{ opponentName }` |
| `waiting_for_opponent` | `{}` |
| `start_countdown` | `{}` |
| `reveal_result` | `{ yourChoice, opponentChoice, winner }` |
| `opponent_disconnected` | `{}` |
| `rematch_ready` | `{}` |

## Build Order

1. **Project scaffold** — Vite client + Node server + shared types, Socket.io connected
2. **Room management** — `create_room` / `join_room` with 6-character alphanumeric codes
3. **Name entry + room screens** — NameEntry → RoomScreen flow
4. **Choice submission** — Hidden buttons, server stores both choices
5. **Countdown + reveal** — Timed text animation, ASCII art reveal
6. **Winner logic + scoreboard** — Determine winner, update session counts
7. **Rematch + disconnect handling** — Rematch flow, graceful disconnect messages
8. **Polish** — Mobile layout, copy-to-clipboard room code button
