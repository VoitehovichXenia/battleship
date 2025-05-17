import { RoomUsers } from './rooms';

export type GameData = {
  idGame: string
  players: string[]
}

export class Games {
  private _games: GameData[] = [];

  public getAll(): GameData[] {
    return this._games;
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
}