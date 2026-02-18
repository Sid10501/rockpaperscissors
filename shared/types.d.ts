/**
 * Shared types for Rock Paper Scissors — single source of truth.
 * Client mirrors these in client/src/types.ts or imports from shared.
 */
export type Choice = 'rock' | 'paper' | 'scissors';
export interface Player {
    id: string;
    name: string;
    socketId: string;
}
export type AiDifficulty = 'random' | 'adaptive' | 'hard';
export interface Room {
    code: string;
    players: Player[];
    /** socketId -> choice for current round */
    choices: Map<string, Choice>;
    /** socketId -> { wins, losses, ties } */
    scores: Map<string, {
        wins: number;
        losses: number;
        ties: number;
    }>;
    /** Both players must request to start next round */
    rematchRequested: Set<string>;
    /** AI opponent: single-player room */
    isAiRoom?: boolean;
    aiDifficulty?: AiDifficulty;
    aiHistory?: Choice[];
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
