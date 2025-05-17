import { WebSocketServer, Server } from 'ws';
import { Players } from './storage/players';
import { Rooms } from './storage/rooms';
import { Winners } from './storage/winners';
import { Games } from './storage/games';
import { MESSAGES, WS_PORT, WSMessage } from './constants';
import { handleReg } from './handlers/handleReg';
import { handleGlobalUpdate } from './handlers/handleGlobalUpdate';

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

    } catch {
      console.log('WS error');
    }
  });

  ws.on('close', () => console.log('Client disconnected'));
});

console.log(`WebSocket server started on ws://localhost:${WS_PORT}`);