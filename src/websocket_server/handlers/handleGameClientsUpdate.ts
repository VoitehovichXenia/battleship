import { RoomData } from '../storage/rooms/constants';
import { MessagesProps, WSMessage, WSMessagesType } from '../constants/constants';
import { logOnResponse } from '../utils/logs';

type HandleGameClientsUpdate = Pick<MessagesProps, 'id'> & {
  room: RoomData
  data: unknown
  type: WSMessagesType
}

export const handleGameClientsUpdate = ({ room, data, type, id }: HandleGameClientsUpdate) => {
  const resData: WSMessage = {
    type,
    data: JSON.stringify(data),
    id
  };
  logOnResponse(JSON.stringify(resData));
  const wsPlayers = room?.ws;
  wsPlayers?.forEach(({ ws }) => {
    ws?.send(JSON.stringify(resData));
  });
};