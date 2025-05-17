import { RoomData } from '../storage/rooms';
import { WSMessage } from '../constants';

type HandleGameClientsUpdate = {
  room: RoomData,
  data: WSMessage
}

export const handleGameClientsUpdate = ({ room, data }: HandleGameClientsUpdate) => {
  const wsPlayers = room?.ws;
  wsPlayers?.forEach(({ ws }) => {
    console.log('WS respone', data);
    ws.send(JSON.stringify(data));
  });
};