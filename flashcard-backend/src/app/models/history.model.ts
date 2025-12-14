// src/app/models/history.model.ts
export interface HistoryEntry {
  _id?: string;
  userId: string;
  gameMode: 'solo' | 'multi';
  score: number;
  maxScore: number;
  date: string; // ISO string
  duration?: number; // en secondes
}
