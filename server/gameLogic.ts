/**
 * Pure game logic — no side effects. Used by server to determine round winner.
 */
import type { Choice } from '../shared/types.js';

const BEATS: Record<Choice, Choice> = {
  rock: 'scissors',
  paper: 'rock',
  scissors: 'paper',
};

/**
 * Returns which player won. player1 = first choice, player2 = second choice.
 * Used with socket order: player1 = room.players[0], player2 = room.players[1].
 */
export function determineWinner(
  a: Choice,
  b: Choice
): 'player1' | 'player2' | 'tie' {
  if (a === b) return 'tie';
  return BEATS[a] === b ? 'player1' : 'player2';
}
