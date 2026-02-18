/**
 * Express + Socket.io server. Handles create_room, join_room, submit_choice, request_rematch, disconnect.
 */
import express, { type Request, type Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { determineWinner } from './gameLogic.js';
import {
  createRoom,
  joinRoom,
  getRoomBySocketId,
  setChoice,
  clearRound,
  addRematchRequest,
  deleteRoom,
  getOpponentSocketId,
} from './roomManager.js';
import { getAiChoice } from './aiOpponent.js';
import { recordResult, getTop10 } from './leaderboard.js';
import type { Choice, AiDifficulty } from '../shared/types.js';

const PORT = process.env.PORT ?? 3001;
const COUNTDOWN_MS = 4000;

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled rejection at', p, reason);
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173', methods: ['GET', 'POST'] },
  path: '/socket.io',
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

function isValidChoice(v: unknown): v is Choice {
  return v === 'rock' || v === 'paper' || v === 'scissors';
}

io.on('connection', (socket) => {
  socket.on('ping', () => {
    socket.emit('pong');
  });

  socket.on('create_room', (payload: unknown) => {
    try {
      const { playerName } = payload as { playerName?: string };
      if (typeof playerName !== 'string' || !playerName.trim()) {
        socket.emit('room_created', { error: 'Invalid playerName' });
        return;
      }
      const { room } = createRoom(playerName, socket.id);
      socket.join(room.code);
      socket.emit('room_created', { roomCode: room.code });
    } catch (err) {
      socket.emit('room_created', { error: 'Failed to create room' });
    }
  });

  socket.on('play_vs_ai', (payload: unknown) => {
    try {
      const { playerName, difficulty } = payload as { playerName?: string; difficulty?: AiDifficulty };
      if (typeof playerName !== 'string' || !playerName.trim()) {
        socket.emit('room_created', { error: 'Invalid playerName' });
        return;
      }
      const validDifficulty: AiDifficulty = difficulty === 'adaptive' || difficulty === 'hard' ? difficulty : 'random';
      const { room } = createRoom(playerName, socket.id);
      room.players.push({ id: 'ai', name: 'AI', socketId: 'ai' });
      room.scores.set('ai', { wins: 0, losses: 0, ties: 0 });
      room.isAiRoom = true;
      room.aiDifficulty = validDifficulty;
      room.aiHistory = [];
      socket.join(room.code);
      socket.emit('room_created', { roomCode: room.code });
      socket.emit('game_ready', { opponentName: 'AI' });
    } catch (err) {
      socket.emit('room_created', { error: 'Failed to create AI room' });
    }
  });

  socket.on('join_room', (payload: unknown) => {
    try {
      const { roomCode, playerName } = payload as { roomCode?: string; playerName?: string };
      if (typeof roomCode !== 'string' || typeof playerName !== 'string' || !playerName.trim()) {
        socket.emit('room_joined', { error: 'Invalid roomCode or playerName' });
        return;
      }
      const result = joinRoom(roomCode, playerName, socket.id);
      if ('error' in result) {
        socket.emit('room_joined', { error: result.error });
        return;
      }
      const { room, player } = result;
      socket.join(room.code);
      const creator = room.players[0];
      if (creator) {
        io.to(creator.socketId).emit('opponent_joined', { opponentName: player.name });
      }
      socket.emit('game_ready', { opponentName: creator?.name });
    } catch (err) {
      socket.emit('room_joined', { error: 'Failed to join room' });
    }
  });

  socket.on('submit_choice', (payload: unknown) => {
    try {
      const { choice } = payload as { choice?: unknown };
      if (!isValidChoice(choice)) {
        socket.emit('reveal_result', { error: 'Invalid choice' });
        return;
      }
      const room = getRoomBySocketId(socket.id);
      if (!room) return;
      setChoice(room, socket.id, choice);
      if (room.isAiRoom && room.aiHistory !== undefined && room.aiDifficulty) {
        const aiChoice = getAiChoice(room.aiHistory, room.aiDifficulty);
        room.choices.set('ai', aiChoice);
        room.aiHistory.push(choice);
      }
      const playerCount = room.players.length;
      const choiceCount = room.choices.size;
      if (playerCount === 2 && choiceCount === 2) {
        io.to(room.code).emit('start_countdown');
        setTimeout(() => {
          const p0 = room.players[0];
          const p1 = room.players[1];
          if (!p0 || !p1) return;
          const c0 = room.choices.get(p0.socketId);
          const c1 = room.choices.get(p1.socketId);
          if (c0 === undefined || c1 === undefined) return;
          const result = determineWinner(c0, c1);
          const s0 = room.scores.get(p0.socketId);
          const s1 = room.scores.get(p1.socketId);
          if (s0) {
            if (result === 'player1') s0.wins++;
            else if (result === 'player2') s0.losses++;
            else s0.ties++;
          }
          if (s1) {
            if (result === 'player2') s1.wins++;
            else if (result === 'player1') s1.losses++;
            else s1.ties++;
          }
          const winnerPerspective: 'you' | 'opponent' | 'tie' =
            result === 'tie' ? 'tie' : result === 'player1' ? 'you' : 'opponent';
          const loserPerspective: 'you' | 'opponent' | 'tie' =
            result === 'tie' ? 'tie' : result === 'player2' ? 'you' : 'opponent';
          io.to(p0.socketId).emit('reveal_result', {
            yourChoice: c0,
            opponentChoice: c1,
            winner: winnerPerspective,
          });
          io.to(p1.socketId).emit('reveal_result', {
            yourChoice: c1,
            opponentChoice: c0,
            winner: loserPerspective,
          });
          if (!room.isAiRoom) {
            const r0 = result === 'player1' ? 'win' : result === 'player2' ? 'loss' : 'tie';
            const r1 = result === 'player2' ? 'win' : result === 'player1' ? 'loss' : 'tie';
            recordResult(p0.name, r0);
            recordResult(p1.name, r1);
            io.to(room.code).emit('leaderboard_update', { topPlayers: getTop10() });
          }
          clearRound(room);
        }, COUNTDOWN_MS);
      } else {
        socket.emit('waiting_for_opponent', {});
      }
    } catch (err) {
      socket.emit('reveal_result', { error: 'Server error' });
    }
  });

  const ALLOWED_REACTION_EMOJIS = new Set(['😂', '🔥', '👀', '💀', '🙏']);
  socket.on('send_reaction', (payload: unknown) => {
    try {
      const { emoji } = payload as { emoji?: string };
      if (typeof emoji !== 'string' || !ALLOWED_REACTION_EMOJIS.has(emoji)) return;
      const room = getRoomBySocketId(socket.id);
      if (!room || room.isAiRoom) return;
      const opponentId = getOpponentSocketId(room, socket.id);
      if (opponentId) io.to(opponentId).emit('reaction_received', { emoji });
    } catch {
      // no-op
    }
  });

  socket.on('request_rematch', () => {
    try {
      const room = getRoomBySocketId(socket.id);
      if (!room) return;
      if (room.isAiRoom) {
        clearRound(room);
        io.to(room.code).emit('rematch_ready', {});
        return;
      }
      const bothReady = addRematchRequest(room, socket.id);
      if (bothReady) {
        clearRound(room);
        io.to(room.code).emit('rematch_ready', {});
      }
    } catch (err) {
      // no-op
    }
  });

  socket.on('disconnect', () => {
    const room = getRoomBySocketId(socket.id);
    if (room) {
      if (room.isAiRoom) {
        deleteRoom(room.code);
        return;
      }
      const opponentId = getOpponentSocketId(room, socket.id);
      if (opponentId) {
        io.to(opponentId).emit('opponent_disconnected', {});
      }
      const stillInRoom = room.players.filter((p) => p.socketId !== socket.id);
      if (stillInRoom.length === 0) {
        deleteRoom(room.code);
      } else {
        room.players = stillInRoom;
        room.choices.delete(socket.id);
        room.scores.delete(socket.id);
        room.rematchRequested.delete(socket.id);
      }
    }
  });
});

const HOST = process.env.HOST ?? '0.0.0.0';
httpServer.listen(Number(PORT), HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
