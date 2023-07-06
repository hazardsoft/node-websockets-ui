import { Ship } from "./types.js";

type ShipPart = {
    x: number;
    y: number;
    hit: boolean;
};

export class ShipWithPositions {
    private parts: ShipPart[] = [];

    constructor(ship: Ship) {
        for (let i = 0; i < ship.length; i++) {
            this.parts.push({
                x: ship.direction ? ship.position.x : ship.position.x + i,
                y: ship.direction ? ship.position.x + i : ship.position.y,
                hit: false,
            });
        }
    }

    public hit(x: number, y: number): void {
        const part = this.parts.find((part) => part.x === x && part.y === y);
        if (part) part.hit = true;
    }

    public isDestroyed(): boolean {
        return this.parts.every((part) => part.hit);
    }

    public toString(): string {
        return this.parts.reduce((acc, part) => {
            acc.length > 0 ? (acc += ";") : "";
            return (acc += `${part.x}/${part.y}:${part.hit}`);
        }, "");
    }
}
