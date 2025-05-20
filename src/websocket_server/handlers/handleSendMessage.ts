import { WebSocket } from 'ws';
import { WSMessage } from '../constants/constants';
import { logOnResponse } from '../utils/logs';

export const handleSendMessage = (data: WSMessage, ws: WebSocket) => {
  logOnResponse(JSON.stringify(data));
  ws.send(JSON.stringify(data));
};