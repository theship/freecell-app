export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  color: 'red' | 'black';
}

export interface GameState {
  freeCells: (Card | null)[];
  foundations: Card[][];
  tableau: Card[][];
  isWon: boolean;
  moves: number;
  startTime: number;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  winPercentage: number;
  averageMoves: number;
  bestTime: number;
}