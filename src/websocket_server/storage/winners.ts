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
}