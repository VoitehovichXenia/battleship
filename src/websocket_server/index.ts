import { WebSocketServer, Server } from 'ws';
import { Players } from './storage/players';
import { Rooms } from './storage/rooms';
import { Winners } from './storage/winners';
import { Game } from './storage/game';
import { MESSAGES, WS_PORT, WSMessage } from './constants/constants';
import { handleReg } from './handlers/handleReg';
import { handleGlobalUpdate } from './handlers/handleGlobalUpdate';
import { handleGameClientsUpdate } from './handlers/handleGameClientsUpdate';
import { logOnConnection, logOnMessage, logOnResponse } from './utils/logs';
import { generateShipsMap } from './utils/generateShipsMap';
import { BOT_NAME, SINGLE_PLAY_MODE } from './constants/game';
import { PlayerData } from './storage/players/constants';
import { RoomData } from './storage/rooms/constants';

const wss: Server = new WebSocketServer({ port: WS_PORT });
const players = new Players();
const rooms = new Rooms();
const winners = new Winners();
const games = new Game();

wss.on('connection', function connection(ws) {
  let registeredUser: string;
  const connectionId: number = wss.clients.size;
  let botTimerId: ReturnType<typeof setTimeout> | undefined;

  logOnConnection(`Client ${connectionId} connected`);
  
  ws.on('message', function message(message: string) {
    try {
      const parsedMessage = JSON.parse(message);
      const { type, data, id }: WSMessage = parsedMessage;

      logOnMessage(parsedMessage);

      if (type === MESSAGES.reg) {
        const username = handleReg({ type, id, data, players, ws });
        if (username) {
          registeredUser = username;
          handleGlobalUpdate({ wss, type: MESSAGES.updateRoom, id, data: rooms });
          handleGlobalUpdate({ wss, type: MESSAGES.updateWinners, id, data: winners });
        }
      }

      if (type === MESSAGES.createRoom) {
        const currentPlayer = players.get(registeredUser) as PlayerData;
        const isRoomCreated = rooms.create({ user: currentPlayer, ws });
        if (isRoomCreated) {
          handleGlobalUpdate({ wss, type: MESSAGES.updateRoom, id, data: rooms });
        }
      }

      if (type === MESSAGES.addUserToRoom) {
        const { indexRoom } = JSON.parse(data);
        const currentPlayer = players.get(registeredUser) as PlayerData;
        const roomId = rooms.addUserToRoom({ user: currentPlayer, roomId: indexRoom, ws });
        if (roomId) {
          handleGlobalUpdate({ wss, type: MESSAGES.updateRoom, id, data: rooms });
          const room = rooms.get(roomId) as RoomData;
          const roomUsers = room?.roomUsers;
          const wsPlayers = room?.ws;
          const game = games.createGame({ roomId, roomUsers });
          wsPlayers?.forEach(({ user, ws }) => {
            const gameData = {
              idGame: game?.idGame,
              idPlayer: game?.players.find(item => item.includes(`${user}-`))
            };
            const resData: WSMessage = {
              type: MESSAGES.createGame,
              data: JSON.stringify(gameData),
              id,
            };

            logOnResponse(resData);
            ws.send(JSON.stringify(resData));
          });
        }
      }

      if (type === MESSAGES.addShips) {
        const { gameId, ships, indexPlayer } = JSON.parse(data);
        const currentGame = games.get(gameId);
        
        if (currentGame?.type === SINGLE_PLAY_MODE) {
          const botIndex = currentGame.players.find(name => name.startsWith(`${BOT_NAME}-`));
          if (botIndex) {
            const generatedBotShips = generateShipsMap();
            games.addPlayerShips({ gameId, indexPlayer: botIndex, ships: generatedBotShips });
          }
        }

        const shipsInfo = games.addPlayerShips({ gameId, ships, indexPlayer });
        if (shipsInfo && shipsInfo.length === 2) {
          const roomId = gameId.slice(0, gameId.lastIndexOf('-'));
          const room = rooms.get(roomId);
          if (room) {
            handleGameClientsUpdate({
              type: MESSAGES.startGame,
              room,
              data: {
                ships,
                currentPlayerIndex: indexPlayer
              },
              id
            });
            handleGameClientsUpdate({
              type: MESSAGES.turn,
              room,
              data: { currentPlayer: indexPlayer },
              id
            });
          }
        }
      }

      if (type === MESSAGES.attack || type === MESSAGES.randomAttack) {
        const messageData = JSON.parse(data);
        const gameId = messageData.gameId;
        const indexPlayer = messageData.indexPlayer;
        let x: number;
        let y: number;

        if (type === MESSAGES.attack) {
          x = messageData.x;
          y = messageData.y;
        } else {
          const randomPos = games.generateRandomAttack({ gameId, indexPlayer });
          x = randomPos.x;
          y = randomPos.y;
        }
        
        const currentTurn = games.getCurrentTurn(gameId);
        const roomId = gameId.slice(0, gameId.lastIndexOf('-'));
        const room = rooms.get(roomId) as RoomData;

        if (currentTurn && currentTurn !== indexPlayer || botTimerId) {
          return;
        };

        const status = games.handleAttack({ gameId, indexPlayer, x, y });
        const isGameFinished = games.checkIfGameIsFinished({ gameId, indexPlayer });
        if (status && room) {
          handleGameClientsUpdate({
            type: MESSAGES.attack,
            id,
            room,
            data: {
              position: { x, y },
              currentPlayer: indexPlayer,
              status
            }
          });
          
          if (!isGameFinished) {
            const nextTurn = games.handleTurn({ status, indexPlayer, gameId });
            const currentGame = games.get(gameId);
            const botIndex = currentGame?.players.find(name => name.startsWith(`${BOT_NAME}-`));

            handleGameClientsUpdate({
              type: MESSAGES.turn,
              id,
              room,
              data: { currentPlayer: nextTurn }
            });

            if (room.type === SINGLE_PLAY_MODE && botIndex && nextTurn === botIndex) {
              botTimerId = setTimeout(async () => {
                const isFinished = await games.handleBotAttack({ gameId, indexPlayer: botIndex, id, room });
                const timerId = botTimerId;
                if (isFinished) {
                  const winner = room.roomUsers.find(user => indexPlayer.startsWith(`${user.name}-`));
                  if (winner && winner?.name && winner?.name !== 'bot') {
                    winners.add(winner?.name);
                  }
                  handleGlobalUpdate({ wss, type: MESSAGES.updateWinners, id, data: winners });
                }
                botTimerId = undefined;
                clearTimeout(timerId);
              }, 3000);
            }
          } else {
            handleGameClientsUpdate({ room, data: { winPlayer: indexPlayer }, id, type: MESSAGES.finish });
            const winner = room.roomUsers.find(user => indexPlayer.startsWith(`${user.name}-`));
            if (winner) {
              winners.add(winner?.name);
            }
            handleGlobalUpdate({ wss, type: MESSAGES.updateWinners, id, data: winners });
          }
        }
      }

      if (type === MESSAGES.single) {
        const currentPlayer = players.get(registeredUser) as PlayerData;
        const newRoom = rooms.create({ user: currentPlayer, ws, type: SINGLE_PLAY_MODE });
        if (newRoom) {
          const roomId = rooms.addUserToRoom({ user: { name: BOT_NAME }, roomId: newRoom?.roomId });
          if (roomId) {
            const room = rooms.get(roomId) as RoomData;
            handleGlobalUpdate({ wss, type: MESSAGES.updateRoom, id, data: rooms });
            const roomUsers = room?.roomUsers;
            const game = games.createGame({ roomId, roomUsers, type: SINGLE_PLAY_MODE });

            handleGameClientsUpdate({
              type: MESSAGES.createGame,
              id,
              room,
              data: {
                idGame: game?.idGame,
                idPlayer: game?.players.find(item => item.includes(`${currentPlayer?.name}-`))
              }
            });
          }
        }
      }

    } catch {
      console.log('WS error');
    }
  });

  ws.on('close', () => {
    players.remove(registeredUser);
    logOnConnection(`Client ${connectionId} disconnected`);
  });
});

console.log(`WebSocket server started on ws://localhost:${WS_PORT}`);