import { BOT_NAME } from '../../constants/game';
import { NAME_INVALID, NAME_RESERVED, NAME_USED, PlayerData, USER_LOGGED } from './constants';

export class Players {
  private _players: PlayerData[] = [];

  public getAll(): PlayerData[] {
    return this._players;
  }

  public get(name: string): PlayerData | undefined {
    return this._players.find(player => player.name === name);
  }

  public add({ name, password }: PlayerData): PlayerData {
    const existingUser = this._players.find(player => player.name === name);
    const index = this._players.length - 1;
    let error = false;
    let errorText = '';
    const isInvalidName = !/^[a-zA-Z0-9_]{3,16}$/.test(name);

    if (existingUser || name === BOT_NAME || isInvalidName) {
      error = true;
      if (password === existingUser?.password) {
        errorText = USER_LOGGED;
      } else if (name === BOT_NAME) {
        errorText = NAME_RESERVED;
      } else if (isInvalidName) {
        errorText = NAME_INVALID;
      } else {
        errorText = NAME_USED;
      }
    }

    if (!existingUser && name !== BOT_NAME) this._players.push({ name });

    return { name, password, index, error, errorText };
  }

  public remove(name: string): void {
    this._players = this._players.filter(user => user.name !== name);
  }
}