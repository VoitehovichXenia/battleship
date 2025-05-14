export type PlayerData = {
  name: string
  password?: string
  index?: number | string
  error?: boolean
  errorText?: string
}
export class Players {
  private _players: PlayerData[] = [];

  public getAll(): PlayerData[] {
    return this._players;
  }

  public get(name: string): PlayerData | undefined {
    return this._players.find(player => player.name === name);
  }

  public add({ name, password }: PlayerData): PlayerData {
    const isUsernameInUse = this._players.find(player => player.name === name);
    if (!isUsernameInUse) {
      this._players.push({ name });
      return { name, password, index: this._players.length - 1, error: false, errorText: '' };
    }
    return { name, password, index: this._players.length - 1, error: true, errorText: 'Username is already in use' };
  }
}