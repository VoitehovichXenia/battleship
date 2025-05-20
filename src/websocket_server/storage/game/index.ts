import { getRandomInteger } from '../../utils/getRandomInteger';
import { MESSAGES } from '../../constants/constants';
import { ATTACK_STATUS, AttackStatus, ShipPosition, ShipsInfo, USUAL_MODE } from '../../constants/game';
import { handleGameClientsUpdate } from '../../handlers/handleGameClientsUpdate';
import { delay } from '../../utils/delay';
import { AddPlayerShipsProps, BotData, CreateGameProps, GameData, GameShipsInfo, GamesMethodsProps, HandleAttackProps, HandleBotAttackProps, HandleTurnProps, MoveData } from './constants';

export class Game {
  private _games: GameData[] = [];
  private _bot: BotData = {
    moves: [],
    targetQueue: null
  };

  private _getEnemyShips({ gameId, indexPlayer }: GamesMethodsProps): ShipsInfo[] | undefined {
    const currentGame = this.get(gameId);
    if (currentGame) {
      const enemyShips = currentGame.ships?.find(ships => ships.player !== indexPlayer);
      return enemyShips?.ships;
    }
  }

  private _getEnemyId({ indexPlayer, gameId }: GamesMethodsProps): string {
    const currentGame = this.get(gameId);
    if (currentGame) {
      const enemyId = currentGame.players.find(item => item !== indexPlayer);
      return enemyId || '';
    }
    return '';
  }

  public getMoves({ gameId, indexPlayer }: GamesMethodsProps): MoveData[] | undefined {
    const currentGame = this.get(gameId);
    return currentGame?.moves?.[indexPlayer];
  }

  public getAll() {
    return this._games;
  }

  public get(gameId: string): GameData | undefined {
    return this._games.find(game => game.idGame === gameId);
  }

  public createGame({ type, roomId, roomUsers }: CreateGameProps): GameData | null {
    const gamesInThisRoom = this._games.filter(game => game.idGame.includes(roomId)).length;
    const newGame: GameData = {
      type: type || USUAL_MODE,
      idGame: `${roomId}-${gamesInThisRoom + 1}`,
      players: roomUsers.map(user => `${user.name}-${user.index}`),
      moves: {
        [`${roomUsers[0].name}-${roomUsers[0].index}`]: [],
        [`${roomUsers[1].name}-${roomUsers[1].index}`]: []
      }
    };
    this._games.push(newGame);
    return newGame;
  }

  public addPlayerShips({ gameId, indexPlayer, ships }: AddPlayerShipsProps): GameShipsInfo[] | null {
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

  public handleAttack({ gameId, indexPlayer, x, y }: HandleAttackProps): AttackStatus {
    const moves = this.getMoves({ gameId, indexPlayer });
    const enemyShips = this._getEnemyShips({ gameId, indexPlayer });
    if (enemyShips) {
      for (let i = 0; i < enemyShips.length; i += 1) {
        const ship = enemyShips[i];

        const startX = ship.position.x;
        const startY = ship.position.y;

        const endX = ship.direction ? startX + 1 : startX + ship.length;
        const endY = ship.direction ? startY + ship.length : startY + 1;

        const isShipCoords = x >= startX && x < endX && y >= startY && y < endY;

        if (isShipCoords) {
          ship.wounds = ship.wounds || [];
          ship.wounds.push({ x, y });
          if (ship.wounds.length === ship.length) return ATTACK_STATUS.killed;
          return ATTACK_STATUS.shot;
        }
      };
    }

    moves?.push({ x, y });
    return ATTACK_STATUS.miss;
  }

  public async handleBotAttack({ gameId, indexPlayer, id, room }: HandleBotAttackProps): Promise< boolean> {
    let status: AttackStatus | undefined;
    let isFinished: boolean = false;
    const moves = this._bot.moves;
    
    while (status !== ATTACK_STATUS.miss && !isFinished) {
      const { x, y } = this.generateRandomAttack({ gameId, indexPlayer });
      moves.push({ x, y });

      // TODO: Make bot smarter

      status = this.handleAttack({ gameId, indexPlayer, x, y });

      handleGameClientsUpdate({
        type: MESSAGES.attack,
        room,
        id,
        data: {
          position: { x, y },
          currentPlayer: indexPlayer,
          status
        }
      });

      isFinished = this.checkIfGameIsFinished({ gameId, indexPlayer });
      if (!isFinished && status) {
        const nextTurn = this.handleTurn({ status, indexPlayer, gameId });
        handleGameClientsUpdate({
          type: MESSAGES.turn,
          id,
          room,
          data: { currentPlayer: nextTurn }
        });
      } else {
        handleGameClientsUpdate({
          type: MESSAGES.finish,
          id,
          room,
          data: { winPlayer: indexPlayer }
        });
      }
      await delay(1500);
    }

    return isFinished;
  }

  public handleTurn({ status, indexPlayer, gameId }: HandleTurnProps) {
    if (status === 'killed' || status === 'shot') {
      this.setCurrentTurn({ gameId, indexPlayer });
      return indexPlayer;
    }
    const enemyId = this._getEnemyId({ indexPlayer, gameId });
    if (enemyId) {
      this.setCurrentTurn({ gameId, indexPlayer: enemyId });
    }
    return enemyId;
  }

  public getCurrentTurn({ gameId }: Pick<GamesMethodsProps, 'gameId'>): string | undefined {
    const currentGame = this.get(gameId);
    if (currentGame) {
      return currentGame.currentTurn;
    }
  }

  public setCurrentTurn({ gameId, indexPlayer }: GamesMethodsProps): string | undefined {
    const currentGame = this.get(gameId);
    if (currentGame) {
      currentGame.currentTurn = indexPlayer;
      return currentGame.currentTurn;
    }
  }

  public generateRandomAttack({ gameId, indexPlayer }: GamesMethodsProps): ShipPosition {
    let isMoveBeenDone: boolean = true;
    const previousMoves = this.getMoves({ gameId, indexPlayer });
    let randomX: number = getRandomInteger(0, 9);
    let randomY: number = getRandomInteger(0, 9);

    if (previousMoves) {
      while (isMoveBeenDone) {
        isMoveBeenDone = previousMoves.some(item => item.x === randomX && item.y === randomY);
        if (!isMoveBeenDone) {
          return { x: randomX, y: randomY };
        } else {
          randomX = getRandomInteger(0, 9);
          randomY = getRandomInteger(0, 9);
        }
      }
    }

    return { x: randomX, y: randomY };
  }

  public checkIfGameIsFinished({ gameId, indexPlayer }: GamesMethodsProps): boolean {
    const enemyShips = this._getEnemyShips({ gameId, indexPlayer });
    if (enemyShips) {
      return enemyShips.every(ship => ship.length === ship.wounds?.length);
    }
    return false;
  }
}