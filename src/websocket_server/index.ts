import { WebSocketServer, Server } from 'ws';
import { Players } from './storage/players';
import { Rooms } from './storage/rooms';
import { Winners } from './storage/winners';
import { Games } from './storage/games';
import { MESSAGES, WS_PORT, WSMessage } from './constants';
import { handleReg } from './handlers/handleReg';
import { handleGlobalUpdate } from './handlers/handleGlobalUpdate';
import { handleGameClientsUpdate } from './handlers/handleGameClientsUpdate';

const wss: Server = new WebSocketServer({ port: WS_PORT });
const players = new Players();
const rooms = new Rooms();
const winners = new Winners();
const games = new Games();
wss.on('connection', function connection(ws) {
  console.log('Client connected');
  let registeredUser: string;
  
  ws.on('message', function message(message: string) {
    try {
      const parsedMessage = JSON.parse(message);
      const { type, data, id }: WSMessage = parsedMessage;

      // TEMPORARY LOG
      // SHOULD BE REMOVED
      console.log('WS message', parsedMessage);

      if (type === MESSAGES.reg) {
        const username = handleReg({ type, id, data, players, ws });
        if (username) {
          registeredUser = username;
          handleGlobalUpdate({ wss, type: MESSAGES.updateRoom, id, data: rooms });
          handleGlobalUpdate({ wss, type: MESSAGES.updateWinners, id, data: winners });
        }
      }

      if (type === MESSAGES.createRoom) {
        const currentPlayer = players.get(registeredUser);
        const isRoomCreated = rooms.create({ user: currentPlayer, ws });
        if (isRoomCreated) {
          handleGlobalUpdate({ wss, type: MESSAGES.updateRoom, id, data: rooms });
        }
      }

      if (type === MESSAGES.addUserToRoom) {
        const { indexRoom } = JSON.parse(data);
        const currentPlayer = players.get(registeredUser);
        const roomId = rooms.addUserToRoom({ user: currentPlayer, roomId: indexRoom, ws });
        if (roomId) {
          handleGlobalUpdate({ wss, type: MESSAGES.updateRoom, id, data: rooms });
          const room = rooms.get(roomId);
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

            ws.send(JSON.stringify(resData));
          });
        }
      }

      if (type === MESSAGES.addShips) {
        const { gameId, ships, indexPlayer } = JSON.parse(data);
        const shipsInfo = games.addPlayerShips({ gameId, ships, indexPlayer });
        if (shipsInfo && shipsInfo.length === 2) {
          const roomId = gameId.slice(0, gameId.lastIndexOf('-'));
          const room = rooms.get(roomId);
          if (room) {
            const shipsData = {
              ships,
              currentPlayerIndex: indexPlayer
            };
            const shipsResData: WSMessage = {
              type: MESSAGES.startGame,
              data: JSON.stringify(shipsData),
              id,
            };
            const turnResData: WSMessage = {
              type: MESSAGES.turn,
              data: JSON.stringify({ currentPlayer: indexPlayer }),
              id
            };
            handleGameClientsUpdate({ room, data: shipsResData });
            handleGameClientsUpdate({ room, data: turnResData });
          }
        } else {
          throw new Error('Ships wasn\'t added');
        }
      }

      if (type === MESSAGES.attack || type === MESSAGES.randomAttack) {
        const messageData = JSON.parse(data);
        const gameId = messageData.gameId;
        const indexPlayer = messageData.indexPlayer;
        let x: number, y: number;
        if (type === MESSAGES.attack) {
          x = messageData.x;
          y = messageData.y;
        } else {
          const randomPos = games.generateRandomAttack();
          x = randomPos.x;
          y = randomPos.y;
        }
        const currentTurn = games.getCurrentTurn(gameId);
        if (currentTurn && currentTurn !== indexPlayer) throw new Error();
        const status = games.handleAttack({ gameId, indexPlayer, x, y });
        const roomId = gameId.slice(0, gameId.lastIndexOf('-'));
        const room = rooms.get(roomId);
        if (status && room) {
          const attackData = {
            position: { x, y },
            currentPlayer: indexPlayer,
            status
          };
          const attackResData: WSMessage = {
            type: MESSAGES.attack,
            data: JSON.stringify(attackData),
            id,
          };
          const turnResData: WSMessage = {
            type: MESSAGES.turn,
            data: JSON.stringify({ currentPlayer: games.handleTurn({ status, playerId: indexPlayer, gameId }) }),
            id
          };
          handleGameClientsUpdate({ room, data: attackResData });
          handleGameClientsUpdate({ room, data: turnResData });
        }
      }

    } catch {
      console.log('WS error');
    }
  });

  ws.on('close', () => console.log('Client disconnected'));
});

console.log(`WebSocket server started on ws://localhost:${WS_PORT}`);