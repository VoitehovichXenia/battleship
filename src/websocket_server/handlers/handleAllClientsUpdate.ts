
import { HandleUpdateAllClients, WSMessage } from '../constants/constants';
import { logOnResponse } from '../utils/logs';

export const handleAllClientsUpdate = ({ wss, data }: HandleUpdateAllClients<WSMessage>) => {
  logOnResponse(JSON.stringify(data));
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};