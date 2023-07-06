import { Ship } from "./types.js";

type ShipPart = {
    x: number;
    y: number;
    hit: boolean;
};

export class ShipWithPositions {
    private parts: ShipPart[] = [];
    private destroyed: boolean = false;

    constructor(ship: Ship) {
        const { x, y } = ship.position;
        const { length } = ship;
        for (let i = 0; i < length; i++) {
            this.parts.push({
                x: ship.direction ? x : x + i,
                y: ship.direction ? y + i : y,
                hit: false,
            });
        }
    }

    public hit(x: number, y: number): void {
        const part = this.parts.find((part) => part.x === x && part.y === y);
        if (part) part.hit = true;
    }

    public isDestroyed(): boolean {
        if (this.destroyed) return true;
        return (this.destroyed = this.parts.every((part) => part.hit));
    }

    public toString(): string {
        const formattedParts: string[] = this.parts.map(
            (part) => `${part.x}/${part.y}:${part.hit}`
        );
        return formattedParts.join(";") + `-destroyed:${this.destroyed}`;
    }
}
