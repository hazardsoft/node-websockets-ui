import { Position } from "../types.js";
import { ShipWithPositions as Ship } from "./Ship.js";
import { shipsConfig, FIELD_SIZE } from "../config.js";

const enum CELL {
    unknown = 0,
    ship = 100,
    near = -1,
}

class ShipsGenerator {
    private field: number[][];
    private availableCells: Position[] = [];

    constructor() {
        this.field = Array.from(Array(FIELD_SIZE), () => Array(FIELD_SIZE).fill(CELL.unknown));
        for (let i = 0; i < FIELD_SIZE; i++) {
            for (let j = 0; j < FIELD_SIZE; j++) {
                this.availableCells.push({ x: i, y: j });
            }
        }
    }

    public generateShips(): Ship[] {
        const ships: Ship[] = [];

        for (const [shipsNum, shipSize] of shipsConfig.entries()) {
            for (let i = 0; i < shipsNum; i++) {
                const ship: Ship = this.placeShip(shipSize);
                ships.push(ship);
            }
        }
        return ships;
    }

    private setCell(x: number, y: number, value: CELL): void {
        this.field[y][x] = value;
    }

    private getCell(x: number, y: number): CELL {
        return this.field[y][x];
    }

    private getRandomPosition(): Position {
        const index = Math.floor(Math.random() * this.availableCells.length);
        return this.availableCells[index];
    }

    private removeAvailablePosition(x: number, y: number): void {
        const index = this.availableCells.findIndex((pos) => pos.x === x && pos.y === y);
        if (index !== -1) {
            this.availableCells.splice(index, 1);
        }
    }

    private placeShip(size: number): Ship {
        let isShipPlaced = false;
        let direction = false;
        let position: Position = { x: 0, y: 0 };

        while (!isShipPlaced) {
            position = this.getRandomPosition();
            direction = Math.random() > 0.5;

            isShipPlaced = this.canPlaceShip(position.x, position.y, direction, size);
        }
        const ship = new Ship(position.x, position.y, direction, size);
        const shipPositions: Position[] = ship.getPositions();
        shipPositions.forEach((pos) => {
            this.setCell(pos.x, pos.y, CELL.ship);
            this.removeAvailablePosition(pos.x, pos.y);
        });

        const nearByPositions = ship.getNearByPositions().filter((pos) => {
            return pos.x >= 0 && pos.x < FIELD_SIZE && pos.y >= 0 && pos.y < FIELD_SIZE;
        });
        nearByPositions.forEach((pos) => {
            this.setCell(pos.x, pos.y, CELL.near);
            this.removeAvailablePosition(pos.x, pos.y);
        });
        return ship;
    }

    private canPlaceShip(x: number, y: number, direction: boolean, size: number): boolean {
        let canBePlaced = true;
        let startX = x;
        let startY = y;
        for (let i = 0; i < size; i++) {
            x = direction ? startX : startX + i;
            y = direction ? startY + i : startY;
            if (x > FIELD_SIZE - 1 || y > FIELD_SIZE - 1) {
                return false;
            }
            canBePlaced = canBePlaced && this.getCell(x, y) === CELL.unknown;
        }
        return canBePlaced;
    }
}

export { ShipsGenerator };
