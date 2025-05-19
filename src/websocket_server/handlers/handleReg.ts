import { WebSocket } from 'ws';
import { WSMessage } from '../constants/constants';
import { Players } from '../storage/players';
import { handleSendMessage } from '../handlers/handleSendMessage';

type HandleReg = WSMessage & {
  players: Players
  ws: WebSocket
}

export const handleReg = ({ type, id, data, players, ws }: HandleReg): string | undefined => {
  const { name, password } = JSON.parse(data);
  const resData = players.add({ name, password });
  const res: WSMessage = {
    type,
    data: JSON.stringify(resData),
    id
  };
  handleSendMessage(res, ws); 
  if (!resData?.error) {
    return name;
  }
};
