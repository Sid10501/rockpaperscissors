/**
 * Client-side mirror of shared/types.ts
 */

export type Choice = 'rock' | 'paper' | 'scissors';

export interface Player {
  id: string;
  name: string;
  socketId: string;
}

export interface Room {
  code: string;
  players: Player[];
  choices: Map<string, Choice>;
  scores: Map<string, { wins: number; losses: number; ties: number }>;
  rematchRequested: Set<string>;
}

export type GameResultWinner = 'you' | 'opponent' | 'tie';

export interface RevealResultPayload {
  yourChoice: Choice;
  opponentChoice: Choice;
  winner: GameResultWinner;
}

export interface LeaderboardPlayer {
  name: string;
  wins: number;
  losses: number;
  ties: number;
  streak: number;
}
