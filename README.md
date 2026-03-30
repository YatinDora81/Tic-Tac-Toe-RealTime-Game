# Tic-Tac-Toe Multiplayer

A real-time multiplayer tic-tac-toe game with matchmaking, Elo rating, and game history.

## Features

- **Real-time gameplay** over WebSockets — moves appear instantly on both screens
- **Three ways to play** — create a private room, join with a code, or match with a random opponent
- **Guest mode** — play without signing up, just pick a name
- **Elo rating system** — registered players get tracked ratings with win/loss/draw stats
- **Timed mode** — 30 seconds per turn, auto-forfeit on timeout
- **Disconnect handling** — 30-second grace period to reconnect before forfeit
- **Multi-device sync** — same account open in two tabs/browsers, both stay in sync
- **Leaderboard** — ranked by Elo rating
- **Game history** — view past games with move-by-move replay

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| HTTP Server | Express, Bun runtime |
| WebSocket Server | ws library, Bun runtime |
| Database | PostgreSQL, Prisma ORM |
| Auth | JWT (jose) |
| Monorepo | Turborepo |
| Language | TypeScript 5.9 |

## Project Structure

```
apps/
  web/              Next.js frontend (port 3000)
  http-server/      REST API for auth, rooms, history, leaderboard (port 8080)
  ws-server/        WebSocket server for real-time gameplay (port 8081)

packages/
  common/           Shared types, schemas, game logic, constants
  db/               Prisma schema and client
  ui/               Shared UI components
  typescript-config/ Shared TS config
  eslint-config/    Shared ESLint config
```

## Architecture

```
Browser ──── REST API (HTTP) ──── PostgreSQL
   │              │
   │         Create room
   │         Auth (signup/signin/guest)
   │         Game history
   │         Leaderboard
   │
   └──── WebSocket Server
              │
         Join room
         Find match
         Make move
         Leave game
         Disconnect/reconnect
```

**Room creation** happens via REST API. **Gameplay** happens via WebSocket. Both servers share the same database.

### WebSocket Messages

| Client sends | Server sends |
|---|---|
| `join_game { roomCode }` | `game_state { board, players, turn, ... }` |
| `find_match { mode? }` | `game_created { roomCode, mode, symbol }` |
| `make_move { position }` | `game_over { result, board, stats }` |
| `leave_game {}` | `player_joined / player_left` |
| | `timer_update { secondsLeft }` |
| | `room_full / error` |

### Database Models

- **User** — registered players with email/password
- **GuestPlayer** — anonymous players (just a name)
- **PlayerStats** — Elo rating, wins, losses, draws, streaks
- **Game** — room code, status, mode, result, timestamps
- **GamePlayer** — links a player (user or guest) to a game with their symbol (X or O)
- **Move** — position, symbol, move number per game

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.3+)
- PostgreSQL database (or [Neon](https://neon.tech) for serverless)

### Setup

```bash
bun install

cp apps/http-server/.env.example apps/http-server/.env
cp apps/ws-server/.env.example apps/ws-server/.env
cp packages/db/.env.example packages/db/.env
```

Fill in the `.env` files:

**`packages/db/.env`**
```
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
```

**`apps/http-server/.env`**
```
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
JWT_SECRET="your-secret-key-here"
CORS_ORIGINS="http://localhost:3000"
HTTP_PORT=8080
```

**`apps/ws-server/.env`**
```
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
JWT_SECRET="your-secret-key-here"
WS_PORT=8081
```

**`apps/web/.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8081
```

### Database

```bash
cd packages/db
npx prisma db push
bun run prisma/seed.ts   # optional: seed sample data
```

### Run

```bash
bun run dev
```

This starts:
- **Web** at http://localhost:3000
- **HTTP API** at http://localhost:8080
- **WebSocket** at ws://localhost:8081

## Game Flow

### Create Room
1. Player creates room via REST API → gets a 6-character room code
2. Shares the code with a friend
3. Both navigate to `/game/:roomCode` → frontend sends `join_game` via WS
4. Second player joins as O → game starts

### Play Random
1. Player clicks "Play Random" → frontend sends `find_match` via WS
2. If no one waiting → player is queued, loader spins
3. When second player sends `find_match` → server creates room, sends `game_created` to both
4. Both navigate to `/game/:roomCode` → same join flow as above

### During Game
- Players take turns clicking cells → `make_move` sent via WS
- Server validates turn, updates board, checks win/draw, broadcasts state
- On win/draw/forfeit/timeout → Elo updated for registered players, stats sent to both

### Disconnect
- Player loses connection → opponent notified, 30s grace period starts
- Reconnect within 30s → game continues from where it left off
- No reconnect → game ends with forfeit
