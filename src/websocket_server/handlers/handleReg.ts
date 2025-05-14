import { WSMessage } from '../constants';
import { Players } from '../storage/players';
import { WebSocket } from 'ws';

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
  ws.send(JSON.stringify(res));  
  if (!resData?.error) {
    return name;
  }
};
