import { WebSocket } from 'ws';
import { PlayerData } from './players';

export type RoomUsers = Array<{
  name: string
  index: string
}>

type ClientInfo = {
  ws: WebSocket
  user: string
}

export type RoomData = {
  roomId: string
  roomUsers: RoomUsers
  ws: ClientInfo[]
}
export class Rooms {
  private _rooms: RoomData[] = [];

  public getAll(): RoomData[] {
    return this._rooms;
  }

  public getAllForResponse(): Omit<RoomData, 'ws'>[] {
    return this._rooms.map(({ roomId, roomUsers }) => ({ roomId, roomUsers }));
  }

  public get(roomId: string): RoomData | undefined {
    return this._rooms.find(room => room.roomId === roomId);
  }

  public create({ user, ws }: { user?: PlayerData, ws: WebSocket }): RoomData | null {
    if (!user) return null;
    const newRoom: RoomData = {
      roomId: `room-${this._rooms.length + 1}`,
      roomUsers: [ { name: user.name, index: 'player-1' } ],
      ws: [
        {
          user: user.name,
          ws
        }
      ]
    };
    this._rooms.push(newRoom);
    return newRoom;
  }

  public addUserToRoom({ user, roomId, ws }: { user?: PlayerData, roomId: string , ws: WebSocket }): string {
    if (!user || !roomId) return '';
    const desiredRoom = this._rooms.find(room => room.roomId === roomId);
    if (desiredRoom) {
      const { roomUsers } = desiredRoom;
      const isUserAlreadyInRoom = roomUsers.find(({ name }) => name === user.name);
      if (!isUserAlreadyInRoom && roomUsers.length < 2) {
        desiredRoom?.roomUsers.push({
          name: user.name,
          index: `player-${desiredRoom?.roomUsers.length + 1}`
        });
        desiredRoom?.ws.push({
          user: user.name,
          ws
        });
        return roomId;
      }
    }
    return '';
  }
}