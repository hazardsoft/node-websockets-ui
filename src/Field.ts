import { Ship, AttackResult } from "./types.js";

const enum CELL {
    UNKNOWN = 0,
    OCEAN = 1,
    SHIP = 2,
    SHIP_HIT = 3,
}

const FIELD_SIZE = 10;

export class Field {
    private cells: CELL[][];
    private ships: Ship[] = [];
    constructor() {
        this.cells = Array.from(Array(FIELD_SIZE), () => Array(FIELD_SIZE).fill(0));
    }

    private setCell(row: number, column: number, value: CELL): void {
        this.cells[column][row] = value;
    }

    private getCell(row: number, column: number): CELL {
        return this.cells[column][row];
    }

    private addShip(ship: Ship): void {
        this.ships.push(ship);
        const { x: startX, y: startY } = ship.position;
        for (let i = 0; i < ship.length; i++) {
            if (ship.direction) {
                this.setCell(startX, startY + i, CELL.SHIP);
            } else {
                this.setCell(startX + i, startY, CELL.SHIP);
            }
        }
    }

    public setShips(ships: Ship[]): void {
        ships.forEach((ship) => this.addShip(ship));

        console.table(this.cells);
        console.log();
    }

    public getShips(): Ship[] {
        return this.ships.slice();
    }

    public attack(x: number, y: number): AttackResult {
        const cell = this.getCell(x, y);
        switch (cell) {
            case CELL.UNKNOWN:
                this.setCell(x, y, CELL.OCEAN);
                return "miss";
            case CELL.SHIP:
                this.setCell(x, y, CELL.SHIP_HIT);
                return "shot";
            default:
                return "miss";
        }
    }
}
