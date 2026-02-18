/**
 * Socket.io client singleton. Import this everywhere — never create a new io() instance.
 */
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.DEV
  ? (import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001')
  : (import.meta.env.VITE_SERVER_URL ?? window.location.origin);

if (!import.meta.env.DEV && !import.meta.env.VITE_SERVER_URL && typeof window !== 'undefined') {
  console.warn('VITE_SERVER_URL not set; socket will use current origin. Set it in Vercel for production.');
}

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  path: '/socket.io',
});
