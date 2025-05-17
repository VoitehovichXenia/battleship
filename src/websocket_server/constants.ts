import { Server } from 'ws';

export const WS_PORT = 3000;

export const MESSAGES = {
  // user events
  reg: 'reg',
  single: 'single_play',
  // room events
  createRoom: 'create_room',
  updateRoom: 'update_room',
  addUserToRoom: 'add_user_to_room',
  // winners events
  updateWinners: 'update_winners',
  // game events
  createGame: 'create_game',
  addShips: 'add_ships',
  startGame: 'start_game',
  attack: 'attack',
  turn: 'turn',
  randomAttack: 'randomAttack'
} as const;

export type WSMessagesType = typeof MESSAGES[keyof typeof MESSAGES]

export type WSMessage = {
  type: WSMessagesType
  data: string
  id: 0
}

export type HandleUpdateAllClients<T> = {
  data: T
  wss: Server
}