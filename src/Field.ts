import { ShipWithPositions } from "./Ship.js";
import { Ship, AttackResult } from "./types.js";

const enum CELL {
    UNKNOWN = 0,
    OCEAN = 1,
    SHIP = 2,
    SHIP_HIT = 3,
}
type CellId = string;
const FIELD_SIZE = 10;

export class Field {
    private cells: CELL[][];
    private ships: Ship[] = [];
    private shipsWithPositions: Map<CellId, ShipWithPositions> = new Map();
    constructor() {
        this.cells = Array.from(Array(FIELD_SIZE), () => Array(FIELD_SIZE).fill(CELL.UNKNOWN));
    }

    private setCell(row: number, column: number, value: CELL): void {
        this.cells[column][row] = value;
    }

    private getCell(row: number, column: number): CELL {
        return this.cells[column][row];
    }

    private addShip(ship: Ship): void {
        this.ships.push(ship);
        const shipWithPositions = new ShipWithPositions(ship);

        const { x: startX, y: startY } = ship.position;
        for (let i = 0; i < ship.length; i++) {
            const x = ship.direction ? startX : startX + i;
            const y = ship.direction ? startY + i : startY;
            this.setCell(x, y, CELL.SHIP);
            this.shipsWithPositions.set(this.getCellId(x, y), shipWithPositions);
        }
    }

    private getCellId(x: number, y: number): string {
        return `${x}${y}`;
    }

    public setShips(ships: Ship[]): void {
        ships.forEach((ship) => this.addShip(ship));
        console.table(this.cells);
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
                const ship = this.shipsWithPositions.get(this.getCellId(x, y));
                ship?.hit(x, y);
                return ship?.isDestroyed() ? "killed" : "shot";
            default:
                return "miss";
        }
    }
}
