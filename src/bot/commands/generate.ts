import { Position } from "../../types.js";
import { ShipWithPositions as Ship } from "../../model/Ship.js";
import { shipsConfig, FIELD_SIZE } from "../../config.js";

const enum CELL {
    unknown = 0,
    ship = 100,
    near = -1,
}

const field: number[][] = Array.from(Array(FIELD_SIZE), () => Array(FIELD_SIZE).fill(CELL.unknown));

const availableCells: Position[] = [];
for (let i = 0; i < FIELD_SIZE; i++) {
    for (let j = 0; j < FIELD_SIZE; j++) {
        availableCells.push({ x: i, y: j });
    }
}

const setCell = (x: number, y: number, value: CELL) => {
    field[y][x] = value;
};

const getCell = (x: number, y: number): CELL => {
    return field[y][x];
};

const getRandomPosition = (): Position => {
    const index = Math.floor(Math.random() * availableCells.length);
    return availableCells[index];
};

const removeAvailablePosition = (x: number, y: number) => {
    const index = availableCells.findIndex((position) => position.x === x && position.y === y);
    if (index !== -1) {
        availableCells.splice(index, 1);
    }
};

const generateShips = (): Ship[] => {
    const ships: Ship[] = [];

    for (const [shipsNum, shipSize] of shipsConfig.entries()) {
        for (let i = 0; i < shipsNum; i++) {
            const ship: Ship = placeShip(shipSize);
            ships.push(ship);
        }
    }
    console.table(field);
    return ships;
};

const placeShip = (size: number): Ship => {
    let isShipPlaced = false;
    let direction = false;
    let position: Position = { x: 0, y: 0 };

    while (!isShipPlaced) {
        position = getRandomPosition();
        direction = Math.random() > 0.5;

        isShipPlaced = canPlaceShip(position.x, position.y, direction, size);
    }
    const ship = new Ship(position.x, position.y, direction, size);
    const shipPositions: Position[] = ship.getPositions();
    shipPositions.forEach((pos) => {
        setCell(pos.x, pos.y, CELL.ship);
        removeAvailablePosition(pos.x, pos.y);
    });

    const nearByPositions = filterInnerPositions(ship.getNearByPositions());
    nearByPositions.forEach((pos) => {
        setCell(pos.x, pos.y, CELL.near);
        removeAvailablePosition(pos.x, pos.y);
    });
    return ship;
};

const filterInnerPositions = (positions: Position[]): Position[] => {
    return positions.filter((position) => {
        return (
            position.x >= 0 && position.x < FIELD_SIZE && position.y >= 0 && position.y < FIELD_SIZE
        );
    });
};

const canPlaceShip = (x: number, y: number, direction: boolean, size: number): boolean => {
    let canBePlaced = true;
    let startX = x;
    let startY = y;
    for (let i = 0; i < size; i++) {
        x = direction ? startX : startX + i;
        y = direction ? startY + i : startY;
        if (x > FIELD_SIZE - 1 || y > FIELD_SIZE - 1) {
            return false;
        }
        canBePlaced = canBePlaced && getCell(x, y) === CELL.unknown;
    }
    return canBePlaced;
};

export { generateShips };
