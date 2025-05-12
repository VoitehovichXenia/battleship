import { WebSocketServer } from 'ws';
import { Players } from './storage/players';

const WS_PORT = 3000;

const MESSAGES = {
  reg: 'reg',
};

type WSMessagesType = keyof typeof MESSAGES

type WSMessage = {
  type: WSMessagesType
  data: string
  id: 0
}

const wss = new WebSocketServer({ port: WS_PORT });
wss.on('connection', function connection(ws) {
  console.log('Client connected');
  
  ws.on('message', async function message(message: string) {
    try {
      const parsedMessage = JSON.parse(message);
      const { type, data, id }: WSMessage = parsedMessage;

      if (type === MESSAGES.reg) {
        const { name, password } = JSON.parse(data);
        const resData = await Players.add({ name, password });
        if (resData) {
          const res: WSMessage = {
            type,
            data: JSON.stringify(data),
            id
          };
          ws.send(JSON.stringify(res));
        }
      }

    } catch {
      console.log('WS error');
    }
  });

  ws.on('close', () => console.log('Client disconnected'));
});

console.log(`WebSocket server started on ws://localhost:${WS_PORT}`);