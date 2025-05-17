import { HandleUpdateAllClients, WSMessage } from '../constants';
import { handleAllClientsUpdate } from './handleAllClientsUpdate';
import { Rooms } from '../storage/rooms';
import { Winners } from '../storage/winners';

type HandleGlobalUpdate = HandleUpdateAllClients<Rooms | Winners> & Omit<WSMessage, 'data'>

export const handleGlobalUpdate = ({ data, wss, type, id }: HandleGlobalUpdate) => {
  if (data) {
    const allData = data.getAllForResponse();
    if (allData) {
      const resData: WSMessage = {
        type,
        data: JSON.stringify(allData),
        id,
      };
      handleAllClientsUpdate({ wss, data: resData });
    }
  }
};