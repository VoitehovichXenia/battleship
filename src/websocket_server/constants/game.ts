// General
export const BOARD_SIZE = 10;
export const BOT_NAME = 'BOT_R2D2';
export const USUAL_MODE = 'usual';
export const SINGLE_PLAY_MODE = 'single_play';

export type GameModes = typeof USUAL_MODE | typeof SINGLE_PLAY_MODE

// Ships
export const SHIPS_CONFIG = [
  { type: 'huge', length: 4, amount: 1 },
  { type: 'large', length: 3, amount: 2 },
  { type: 'medium', length: 2, amount: 3 },
  { type: 'small', length: 1, amount: 4 }
] as const;

export type ShipPosition = { x: number, y: number }
export type ShipType = 'huge' | 'large' | 'medium' | 'small'

export type ShipsInfo = {
  position: ShipPosition
  direction: boolean // false - horizontal, true - vertical
  type: ShipType
  length: number
  wounds?: {x: number, y: number}[]
}

// Attacks
export const ATTACK_STATUS = {
  miss: 'miss',
  shot: 'shot',
  killed: 'killed'
} as const;

export type AttackStatus = typeof ATTACK_STATUS[keyof typeof ATTACK_STATUS]