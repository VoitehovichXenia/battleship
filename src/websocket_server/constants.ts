import { Server } from 'ws';

export const WS_PORT = 3000;

export const MESSAGES = {
  reg: 'reg',
  single: 'single_play',
  createRoom: 'create_room',
  updateRoom: 'update_room',
  updateWinners: 'update_winners',
  addUserToRoom: 'add_user_to_room',
  createGame: 'create_game'
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