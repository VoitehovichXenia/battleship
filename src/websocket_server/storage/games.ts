import { RoomUsers } from './rooms';

type ShipsInfo = {
  position: { x: number, y: number }
  direction: boolean // false - horizontal, true - vertical
  type: 'huge' | 'large' | 'medium' | 'small'
  length: number
}

type GameShipsInfo = {
  player: string
  ships: ShipsInfo[]
}

export type GameData = {
  idGame: string
  players: string[]
  ships?: GameShipsInfo[]
}

export class Games {
  private _games: GameData[] = [];

  public getAll(): GameData[] {
    return this._games;
  }

  public get(gameId: string): GameData | undefined {
    return this._games.find(game => game.idGame === gameId);
  }

  public createGame({ roomId, roomUsers }: {roomId: string, roomUsers?: RoomUsers}): GameData | null {
    if (!roomId || !roomUsers) return null;
    const gamesInThisRoom = this._games.filter(game => game.idGame.includes(roomId)).length;
    const newGame: GameData = {
      idGame: `${roomId}-${gamesInThisRoom + 1}`,
      players: roomUsers.map(user => `${user.name}-${user.index}`)
    };
    this._games.push(newGame);
    return newGame;
  }

  public addPlayerShips({ gameId, indexPlayer, ships }: { gameId: string, indexPlayer: string, ships: ShipsInfo[] }): GameShipsInfo[] | null {
    const currentGame = this.get(gameId);
    if (currentGame) {
      currentGame.ships = currentGame.ships || [];
      currentGame.ships.push({
        player: indexPlayer,
        ships
      });
      return currentGame.ships;
    }
    return null;
  }
}