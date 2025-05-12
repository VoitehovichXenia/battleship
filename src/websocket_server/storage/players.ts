import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';

export type PlayerData = {
  name: string
  password: string
  index?: number | string
}

export class Players {
  static readonly pathToDB: string = resolve(process.cwd(), './src/websocket_server/players.ts');

  static async getAll(): Promise<PlayerData[]> {
    const players = await readFile(Players.pathToDB, { encoding: 'utf-8' });
    return JSON.parse(players);
  }

  static async add({ name, password }: PlayerData): Promise<PlayerData> {
    const players = await Players.getAll();
    players.push({ name, password });
    await writeFile(Players.pathToDB, JSON.stringify(players), { encoding: 'utf-8' });
    return { name, password, index: players.length - 1 };
  }
}