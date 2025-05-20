import { getRandomInteger } from './getRandomInteger';
import { BOARD_SIZE, SHIPS_CONFIG, ShipsInfo, ShipType } from '../constants/game';

export const generateShipsMap = (): ShipsInfo[] => {
  const matrix = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
    
  const isCoordsValid = (x: number, y: number, diffX: number, diffY: number, length: number): boolean => {
    for (let i = -1; i <= length; i++) {
      for (let j = -1; j <= 1; j++) {
        const checkX = x + diffX * i + diffY * j;
        const checkY = y + diffY * i + diffX * j;
        if (checkX < 0 || checkY < 0 || checkX >= BOARD_SIZE || checkY >= BOARD_SIZE) continue;
        if (matrix[checkY][checkX] === 1) return false;
      }
    }
    return true;
  };

  const placeShip = (length: number, type: ShipType): void => {
    let placed = false;

    while (!placed) {
      const direction = Math.random() < 0.5;
      const diffx = direction ? 0 : 1;
      const diffy = direction ? 1 : 0;
      const x = getRandomInteger(0, diffx ? BOARD_SIZE - length : BOARD_SIZE - 1);
      const y = getRandomInteger(0, diffy ? BOARD_SIZE - length : BOARD_SIZE - 1);
      if (!isCoordsValid(x, y, diffx, diffy, length)) continue;
      for (let i = 0; i < length; i++) {
        matrix[y + diffy * i][x + diffx * i] = 1;
      }
      ships.push({
        position: { x, y },
        direction,
        type,
        length
      });
      placed = true;
    }
  };
  
  const ships: ShipsInfo[] = [];

  for (const ship of SHIPS_CONFIG) {
    for (let i = 0; i < ship.amount; i++) {
      placeShip(ship.length, ship.type);
    }
  }

  return ships;
};
