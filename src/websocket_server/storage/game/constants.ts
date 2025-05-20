import { RoomData, RoomUsers } from '../rooms/constants';
import { MessagesProps } from '../../constants/constants';
import { AttackStatus, GameModes, ShipPosition, ShipsInfo } from '../../constants/game';

export type GameShipsInfo = {
  player: string
  ships: ShipsInfo[]
}

export type MoveDirections = 'left' | 'right' | 'up' | 'down'

export type MoveData = ShipPosition & {
  status?: AttackStatus
  direction?: MoveDirections
  diffX?: number
  diffY?: number
}

export type MovesData = {
  [key: string]: MoveData[]
}

export type GameData = {
  type: GameModes
  idGame: string
  players: string[]
  ships?: GameShipsInfo[]
  currentTurn?: string
  moves?: MovesData
}

// Methods types
export type GamesMethodsProps = {
  gameId: string
  indexPlayer: string
}
export type CreateGameProps = { roomId: string, roomUsers: RoomUsers, type?: GameModes }
export type AddPlayerShipsProps = GamesMethodsProps & { ships: ShipsInfo[] }
export type HandleAttackProps = GamesMethodsProps & ShipPosition
export type HandleBotAttackProps = GamesMethodsProps & Pick<MessagesProps, 'id'> & { room: RoomData }
export type HandleTurnProps = GamesMethodsProps & { status: AttackStatus }

export type BotData = {
  targetQueue: MoveData[] | null
  moves: MoveData[]
}