/**
 * In-memory room management. 6-char alphanumeric codes, create/join, state per room.
 */
import type { Room, Player, Choice } from '../shared/types.js';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CODE_LENGTH = 6;

const rooms = new Map<string, Room>();

function generateCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

function ensureUniqueCode(): string {
  let code: string;
  do {
    code = generateCode();
  } while (rooms.has(code));
  return code;
}

export function createRoom(playerName: string, socketId: string): { room: Room; player: Player } {
  const code = ensureUniqueCode();
  const player: Player = {
    id: crypto.randomUUID(),
    name: playerName.trim(),
    socketId,
  };
  const room: Room = {
    code,
    players: [player],
    choices: new Map(),
    scores: new Map(),
    rematchRequested: new Set(),
  };
  room.scores.set(socketId, { wins: 0, losses: 0, ties: 0 });
  rooms.set(code, room);
  return { room, player };
}

export function joinRoom(
  roomCode: string,
  playerName: string,
  socketId: string
): { room: Room; player: Player } | { error: string } {
  const code = roomCode.trim().toUpperCase();
  const room = rooms.get(code);
  if (!room) return { error: 'Room not found' };
  if (room.players.length >= 2) return { error: 'Room is full' };
  const player: Player = {
    id: crypto.randomUUID(),
    name: playerName.trim(),
    socketId,
  };
  room.players.push(player);
  room.scores.set(socketId, { wins: 0, losses: 0, ties: 0 });
  return { room, player };
}

export function getRoomByCode(code: string): Room | undefined {
  return rooms.get(code.toUpperCase());
}

export function getRoomBySocketId(socketId: string): Room | undefined {
  for (const room of rooms.values()) {
    if (room.players.some((p) => p.socketId === socketId)) return room;
  }
  return undefined;
}

export function setChoice(room: Room, socketId: string, choice: Choice): void {
  room.choices.set(socketId, choice);
}

export function clearRound(room: Room): void {
  room.choices.clear();
  room.rematchRequested.clear();
}

export function addRematchRequest(room: Room, socketId: string): boolean {
  room.rematchRequested.add(socketId);
  return room.rematchRequested.size === room.players.length;
}

export function deleteRoom(code: string): void {
  rooms.delete(code.toUpperCase());
}

export function getOpponentSocketId(room: Room, socketId: string): string | null {
  const other = room.players.find((p) => p.socketId !== socketId);
  return other ? other.socketId : null;
}

export function getPlayerIndex(room: Room, socketId: string): 0 | 1 | -1 {
  const i = room.players.findIndex((p) => p.socketId === socketId);
  if (i === 0) return 0;
  if (i === 1) return 1;
  return -1;
}
