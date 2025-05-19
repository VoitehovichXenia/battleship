import { USUAL_MODE } from '../../constants/game';
import { AddUserToRoomProps, CreateProps, RoomData } from './constants';

export class Rooms {
  private _rooms: RoomData[] = [];

  public getAll(): RoomData[] {
    return this._rooms;
  }

  public getAllForResponse(): Omit<RoomData, 'ws' | 'type'>[] {
    return this._rooms.map(({ roomId, roomUsers }) => ({ roomId, roomUsers }));
  }

  public get(roomId: string): RoomData | undefined {
    return this._rooms.find(room => room.roomId === roomId);
  }

  public create({ type, user, ws }: CreateProps): RoomData | null {
    const newRoom: RoomData = {
      type: type || USUAL_MODE,
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

  public addUserToRoom({ user, roomId, ws }: AddUserToRoomProps): string {
    const desiredRoom = this._rooms.find(room => room.roomId === roomId);

    if (desiredRoom) {
      const { roomUsers } = desiredRoom;
      const isUserAlreadyInRoom = roomUsers.find(({ name }) => name === user.name);
      if (!isUserAlreadyInRoom && roomUsers.length < 2) {
        desiredRoom?.roomUsers.push({
          name: user.name,
          index: `player-${desiredRoom?.roomUsers.length + 1}`
        });
        if (ws) {
          desiredRoom?.ws.push({
            user: user.name,
            ws
          });
        }
        return roomId;
      }
    }
    return '';
  }
}