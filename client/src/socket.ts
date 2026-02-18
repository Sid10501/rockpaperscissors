/**
 * Socket.io client singleton. Import this everywhere — never create a new io() instance.
 */
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.DEV
  ? (import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001')
  : (import.meta.env.VITE_SERVER_URL ?? window.location.origin);

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  path: '/socket.io',
});
