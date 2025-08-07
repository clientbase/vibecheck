// Define enum values as constants for client-side use
export const VibeLevel = {
  DEAD: 'DEAD',
  MID: 'MID', 
  LIT: 'LIT',
  CHAOTIC: 'CHAOTIC'
} as const;

export const QueueLength = {
  NONE: 'NONE',
  SHORT: 'SHORT',
  LONG: 'LONG', 
  INSANE: 'INSANE'
} as const;

export type VibeLevelType = typeof VibeLevel[keyof typeof VibeLevel];
export type QueueLengthType = typeof QueueLength[keyof typeof QueueLength]; 