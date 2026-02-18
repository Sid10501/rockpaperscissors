/**
 * Persistent leaderboard via SQLite. Optional: if better-sqlite3 is not installed, no-op.
 */
import { createRequire } from 'node:module';
import type { LeaderboardPlayer } from '../shared/types.js';

const require = createRequire(import.meta.url);
let db: InstanceType<typeof import('better-sqlite3')> | null = null;

try {
  const Database = require('better-sqlite3');
  db = new Database('leaderboard.sqlite') as InstanceType<typeof import('better-sqlite3')>;
  db!.exec(`
    CREATE TABLE IF NOT EXISTS players (
      name TEXT PRIMARY KEY,
      wins INTEGER NOT NULL DEFAULT 0,
      losses INTEGER NOT NULL DEFAULT 0,
      ties INTEGER NOT NULL DEFAULT 0,
      streak INTEGER NOT NULL DEFAULT 0
    )
  `);
} catch {
  db = null;
}

export function recordResult(
  playerName: string,
  result: 'win' | 'loss' | 'tie'
): void {
  if (!db) return;
  const name = playerName.trim().slice(0, 64);
  if (!name) return;
  const isWin = result === 'win' ? 1 : 0;
  const isLoss = result === 'loss' ? 1 : 0;
  const isTie = result === 'tie' ? 1 : 0;
  db.prepare(`
    INSERT INTO players (name, wins, losses, ties, streak)
    VALUES (?, 0, 0, 0, 0)
    ON CONFLICT(name) DO UPDATE SET
      wins = wins + ?,
      losses = losses + ?,
      ties = ties + ?,
      streak = CASE WHEN ? = 1 THEN players.streak + 1 ELSE 0 END
  `).run(name, isWin, isLoss, isTie, isWin);
}

export function getTop10(): LeaderboardPlayer[] {
  if (!db) return [];
  const rows = db.prepare(`
    SELECT name, wins, losses, ties, streak
    FROM players
    ORDER BY wins DESC, streak DESC
    LIMIT 10
  `).all() as { name: string; wins: number; losses: number; ties: number; streak: number }[];
  return rows.map((r) => ({
    name: r.name,
    wins: r.wins,
    losses: r.losses,
    ties: r.ties,
    streak: r.streak,
  }));
}
