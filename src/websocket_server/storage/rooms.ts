import { PlayerData } from './players';

export type RoomData = {
  roomId: number | string
  roomUsers: Array<{
    name: string
    index: number | string
  }>
}

export class Rooms {
  private _rooms: RoomData[] = [];

  public getAll(): RoomData[] {
    return this._rooms;
  }

  public create({ user }: { user?: PlayerData }): boolean {
    if (!user) return false;
    const newRoom: RoomData = {
      roomId: `room-${this._rooms.length + 1}`,
      roomUsers: [ { name: user.name, index: 'player-1' } ]
    };
    this._rooms.push(newRoom);
    return true;
  }

  public addUserToRoom({ user, roomId }: { user?: PlayerData, roomId: string | number }): boolean {
    if (!user || !roomId) return false;
    const desiredRoom = this._rooms.find(room => room.roomId === roomId);
    desiredRoom?.roomUsers.push({
      name: user.name,
      index: `player-${desiredRoom?.roomUsers.length + 1}`
    });
    return true;
  }
}