import { ShipWithPositions } from "./Ship.js";
import { Ship, AttackResultType, Position } from "../types.js";
import { FIELD_SIZE } from "../config.js";

export const enum CELL {
    UNKNOWN = 0,
    OCEAN = 1,
    SHIP = 2,
    SHIP_HIT = 3,
}
type CellId = string;

export class Field {
    private cells: CELL[][];
    private origShips: Ship[] = [];
    private ships: Map<CellId, ShipWithPositions> = new Map();
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
        this.origShips.push(ship);
        const shipWithPositions = new ShipWithPositions(
            ship.position.x,
            ship.position.y,
            ship.direction,
            ship.length
        );

        const { x: startX, y: startY } = ship.position;
        for (let i = 0; i < ship.length; i++) {
            const x = ship.direction ? startX : startX + i;
            const y = ship.direction ? startY + i : startY;
            this.setCell(x, y, CELL.SHIP);
            this.ships.set(this.getCellId(x, y), shipWithPositions);
        }
    }

    private getCellId(x: number, y: number): string {
        return `${x}${y}`;
    }

    public setShips(ships: Ship[]): void {
        this.origShips.length = 0;
        ships.forEach((ship) => this.addShip(ship));
    }

    public getShips(): Ship[] {
        return this.origShips.slice();
    }

    public attack(x: number, y: number): AttackResultType {
        const cell = this.getCell(x, y);
        switch (cell) {
            case CELL.UNKNOWN:
                this.setCell(x, y, CELL.OCEAN);
                return "miss";
            case CELL.SHIP:
                this.setCell(x, y, CELL.SHIP_HIT);
                const ship = this.ships.get(this.getCellId(x, y))!;
                ship.hit(x, y);
                return ship.isDestroyed() ? "killed" : "shot";
            default:
                return "none";
        }
    }

    public getPositionsAroundShip(x: number, y: number): Position[] {
        const ship = this.ships.get(this.getCellId(x, y))!;
        let nearByPositions: Position[] = ship.getNearByPositions();
        nearByPositions = nearByPositions.filter((position) => {
            const { x, y } = position;
            return x >= 0 && x < FIELD_SIZE && y >= 0 && y < FIELD_SIZE;
        });
        return nearByPositions;
    }

    public getShipPositions(x: number, y: number): Position[] {
        const ship = this.ships.get(this.getCellId(x, y))!;
        return ship.getPositions();
    }

    public isAllShipsDestroyed(): boolean {
        let result: boolean = true;
        for (const ship of this.ships.values()) {
            result &&= ship.isDestroyed();
        }
        return result;
    }
}

export class OpponentField {
    private cells: CELL[][];
    private readonly attackToCell: Record<AttackResultType, CELL> = {
        miss: CELL.OCEAN,
        shot: CELL.SHIP_HIT,
        killed: CELL.SHIP_HIT,
        none: CELL.UNKNOWN,
    };

    constructor() {
        this.cells = Array.from(Array(FIELD_SIZE), () => Array(FIELD_SIZE).fill(CELL.UNKNOWN));
    }

    private setCell(row: number, column: number, value: CELL): void {
        this.cells[column][row] = value;
    }

    private getCell(row: number, column: number): CELL {
        return this.cells[column][row];
    }

    public markCell(x: number, y: number, attackResult: AttackResultType): void {
        const cellValue = this.attackToCell[attackResult];
        this.setCell(x, y, cellValue);
    }

    public filterPositions(positions: Position[], filterBy: CELL): Position[] {
        return positions.filter((position) => {
            return this.getCell(position.x, position.y) === filterBy;
        });
    }

    public getRandomPositionToAttack(): Position {
        const unknowns: Position[] = [];

        for (let i = 0; i < this.cells.length; i++) {
            const column = this.cells[i];
            for (let j = 0; j < column.length; j++) {
                const row = column[j];
                if (row === CELL.UNKNOWN) {
                    unknowns.push({ x: j, y: i });
                }
            }
        }
        const randomIndex = Math.floor(Math.random() * unknowns.length);
        return unknowns[randomIndex];
    }
}
