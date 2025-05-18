import { RoomUsers } from './rooms';
import { getRandomInteger } from '../utils/getRandomInteger';

type AttackStatus = 'miss' | 'killed' | 'shot'

type ShipPosition = { x: number, y: number }

type ShipsInfo = {
  position: ShipPosition
  direction: boolean // false - horizontal, true - vertical
  type: 'huge' | 'large' | 'medium' | 'small'
  length: number
  wounds?: {x: number, y: number}[]
}

type GameShipsInfo = {
  player: string
  ships: ShipsInfo[]
}

export type GameData = {
  idGame: string
  players: string[]
  ships?: GameShipsInfo[]
  currentTurn?: string
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

  private getEnemyShips({ gameId, indexPlayer }: { gameId: string, indexPlayer: string }): ShipsInfo[] | undefined {
    const currentGame = this.get(gameId);
    if (currentGame) {
      const enemyShips = currentGame.ships?.find(ships => ships.player !== indexPlayer);
      return enemyShips?.ships;
    }
  }

  private getEnemyId({ playerId, gameId }: { playerId: string, gameId: string }): string | undefined {
    const currentGame = this.get(gameId);
    if (currentGame) {
      const enemyId = currentGame.players.find(item => item !== playerId);
      return enemyId;
    }
  }

  public handleAttack({ gameId, indexPlayer, x, y }: { gameId: string, indexPlayer: string, x: number, y: number }): AttackStatus | undefined {
    const enemyShips = this.getEnemyShips({ gameId, indexPlayer });
    if (enemyShips) {
      for (let i = 0; i < enemyShips.length; i += 1) {
        const ship = enemyShips[i];
        const startX = ship.position.x;
        const startY = ship.position.y;
        const endX = ship.direction ? startX : startX + ship.length -1;
        const endY = ship.direction ? startY + ship.length - 1 : startY;
        if (x >= startX && x <= endX && y >= startY && y <= endY && ship.wounds?.length !== ship.length) {
          ship.wounds = ship.wounds || [];
          ship.wounds.push({ x, y });
          if (ship.wounds.length === ship.length) return 'killed';
          return 'shot';
        }
      };
      return 'miss';
    }
  }

  public handleTurn({ status, playerId, gameId }: { status: AttackStatus, playerId: string, gameId: string }) {
    if (status === 'killed' || status === 'shot') {
      this.setCurrentTurn({ gameId, indexPlayer: playerId });
      return playerId;
    }
    const enemyId = this.getEnemyId({ playerId, gameId });
    if (enemyId) {
      this.setCurrentTurn({ gameId, indexPlayer: enemyId });
    }
    return enemyId;
  }

  public getCurrentTurn({ gameId }: { gameId: string }): string | undefined {
    const currentGame = this.get(gameId);
    if (currentGame) {
      return currentGame.currentTurn;
    }
  }

  public setCurrentTurn({ gameId, indexPlayer }: { gameId: string, indexPlayer: string }): string | undefined {
    const currentGame = this.get(gameId);
    if (currentGame) {
      currentGame.currentTurn = indexPlayer;
      return currentGame.currentTurn;
    }
  }

  public generateRandomAttack(): ShipPosition {
    const randomX = getRandomInteger(0, 10);
    const randomY = getRandomInteger(0, 10);
    return { x: randomX, y: randomY };
  }

  public checkIfGameIsFinished({ gameId, indexPlayer }: { gameId: string, indexPlayer: string }): boolean {
    const enemyShips = this.getEnemyShips({ gameId, indexPlayer });
    if (enemyShips) {
      return enemyShips.every(ship => ship.length === ship.wounds?.length);
    }
    return false;
  }
}