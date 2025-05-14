import { HandleUpdateAllClients, WSMessage } from '../constants';

export const handleAllClientsUpdate = ({ wss, data }: HandleUpdateAllClients<WSMessage>) => {
  console.log('WS response', data);
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};