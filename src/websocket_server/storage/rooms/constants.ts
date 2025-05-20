import { WebSocket } from 'ws';
import { GameModes } from '../../constants/game';
import { PlayerData } from '../players/constants';

export type RoomUsers = Array<{
  name: string
  index: string
}>

type ClientInfo = {
  ws: WebSocket
  user: string
}

export type RoomData = {
  type: GameModes
  roomId: string
  roomUsers: RoomUsers
  ws: ClientInfo[]
}

type PlayersMethodsProps =  { type?: GameModes, user: PlayerData }
export type CreateProps = PlayersMethodsProps & { ws: WebSocket }
export type AddUserToRoomProps = PlayersMethodsProps & { roomId: string, ws?: WebSocket }