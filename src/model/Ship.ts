import { Position, Ship } from "../types.js";

type ShipPart = {
    x: number;
    y: number;
    hit: boolean;
};

export class ShipWithPositions {
    private parts: ShipPart[] = [];
    private destroyed: boolean = false;

    constructor(private ship: Ship) {
        const { x, y } = ship.position;
        const { length, direction } = ship;

        for (let i = 0; i < length; i++) {
            this.parts.push({
                x: direction ? x : x + i,
                y: direction ? y + i : y,
                hit: false,
            });
        }
    }

    public hit(x: number, y: number): void {
        const part = this.parts.find((part) => part.x === x && part.y === y);
        if (part) part.hit = true;
    }

    public getPositions(): Position[] {
        return this.parts.map((part) => {
            return { x: part.x, y: part.y };
        });
    }

    public getNearByPositions(): Position[] {
        const positions: Position[] = [];
        const { x: startX, y: startY } = this.ship.position;
        const { direction, length } = this.ship;

        const shipStart: Position = { x: startX, y: startY };
        const shipEnd: Position = {
            x: direction ? startX : startX + length - 1,
            y: direction ? startY + length - 1 : startY,
        };

        const nearByStart: Position = { x: startX - 1, y: startY - 1 };
        const nearByEnd: Position = {
            x: direction ? startX + 1 : startX + length,
            y: direction ? startY + length : startY + 1,
        };

        for (let i = nearByStart.x; i <= nearByEnd.x; i++) {
            for (let j = nearByStart.y; j <= nearByEnd.y; j++) {
                if (!(i >= shipStart.x && i <= shipEnd.x && j >= shipStart.y && j <= shipEnd.y)) {
                    positions.push({ x: i, y: j });
                }
            }
        }

        return positions;
    }

    public isDestroyed(): boolean {
        if (this.destroyed) return true;
        return (this.destroyed = this.parts.every((part) => part.hit));
    }

    public toString(): string {
        const formattedParts: string[] = this.parts.map(
            (part) => `${part.x}/${part.y}:${part.hit ? "hit" : ""}`
        );
        return formattedParts.join(";") + `-destroyed:${this.destroyed}`;
    }
}
