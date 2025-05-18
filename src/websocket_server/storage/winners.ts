export type WinnerData = {
  name: string
  wins: number
}
export class Winners {
  private _winners: WinnerData[] = [];

  public getAll(): WinnerData[] {
    return this._winners;
  }

  public getAllForResponse: () => WinnerData[] = this.getAll;

  public get(name: string) {
    return this._winners.find(winner => winner.name === name);
  }

  public add(name: string) {
    const winner = this.get(name);
    if (winner) {
      winner.wins += 1;
    } else {
      this._winners.push({ name, wins: 1 });
    }
  }
}