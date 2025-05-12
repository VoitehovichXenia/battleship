import { WebSocketServer } from 'ws';

const WS_PORT = 3000;

const wss = new WebSocketServer({ port: WS_PORT });

wss.on('connection', function connection(ws) {
  console.log('Client connected');
  
  ws.on('message', function message(data) {
    console.log('received:', data);
  });

  ws.on('close', () => console.log('Client disconnected'));
});

console.log(`WebSocket server started on ws://localhost:${WS_PORT}`);