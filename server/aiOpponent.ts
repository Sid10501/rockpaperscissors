/**
 * AI opponent: pattern recognition and counter-picking.
 * random = uniform random; adaptive = counter most frequent; hard = simple Markov.
 */
import type { Choice } from '../shared/types.js';

const CHOICES: Choice[] = ['rock', 'paper', 'scissors'];
const BEATS: Record<Choice, Choice> = {
  rock: 'paper',
  paper: 'scissors',
  scissors: 'rock',
};

export type AiDifficulty = 'random' | 'adaptive' | 'hard';

function randomChoice(): Choice {
  return CHOICES[Math.floor(Math.random() * CHOICES.length)]!;
}

/** Counter the most frequently played choice. If tie or empty, random. */
function adaptiveChoice(history: Choice[]): Choice {
  if (history.length === 0) return randomChoice();
  const counts: Record<Choice, number> = { rock: 0, paper: 0, scissors: 0 };
  for (const c of history) {
    counts[c]++;
  }
  const max = Math.max(counts.rock, counts.paper, counts.scissors);
  const most: Choice[] = [];
  if (counts.rock === max) most.push('rock');
  if (counts.paper === max) most.push('paper');
  if (counts.scissors === max) most.push('scissors');
  const pick = most[Math.floor(Math.random() * most.length)] ?? 'rock';
  return BEATS[pick];
}

/** Markov: probability of next move from last move; counter the predicted move. */
function hardChoice(history: Choice[]): Choice {
  if (history.length < 2) return randomChoice();
  const last = history[history.length - 1]!;
  const transitions: Record<Choice, number> = { rock: 0, paper: 0, scissors: 0 };
  for (let i = 0; i < history.length - 1; i++) {
    if (history[i] === last) {
      const next = history[i + 1]!;
      transitions[next]++;
    }
  }
  const max = Math.max(transitions.rock, transitions.paper, transitions.scissors);
  const predicted: Choice[] = [];
  if (transitions.rock === max) predicted.push('rock');
  if (transitions.paper === max) predicted.push('paper');
  if (transitions.scissors === max) predicted.push('scissors');
  const pick = predicted[Math.floor(Math.random() * predicted.length)] ?? randomChoice();
  return BEATS[pick];
}

/**
 * Returns the AI's choice given the player's move history and difficulty.
 */
export function getAiChoice(history: Choice[], difficulty: AiDifficulty): Choice {
  switch (difficulty) {
    case 'random':
      return randomChoice();
    case 'adaptive':
      return adaptiveChoice(history);
    case 'hard':
      return hardChoice(history);
    default:
      return randomChoice();
  }
}
