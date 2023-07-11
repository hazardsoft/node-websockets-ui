import { Position } from "../types.js";

type ShipPart = {
    x: number;
    y: number;
    hit: boolean;
};

export class ShipWithPositions {
    private parts: ShipPart[] = [];
    private positions: Position[] = [];
    private nearByPositions: Position[] = [];
    public direction: boolean = false;
    private destroyed: boolean = false;

    constructor(x: number, y: number, direction: boolean, size: number) {
        this.direction = direction;

        for (let i = 0; i < size; i++) {
            const position: Position = {
                x: direction ? x : x + i,
                y: direction ? y + i : y,
            };
            this.parts.push({
                ...position,
                hit: false,
            });
            this.positions.push(position);
        }

        this.nearByPositions = this.calculateNearByPositions(x, y, direction, size);
    }

    public hit(x: number, y: number): void {
        const part = this.parts.find((part) => part.x === x && part.y === y);
        if (part) part.hit = true;
    }

    public getPositions(): Position[] {
        return this.positions.slice();
    }

    public getNearByPositions(): Position[] {
        return this.nearByPositions.slice();
    }

    public isDestroyed(): boolean {
        if (this.destroyed) return true;
        return (this.destroyed = this.parts.every((part) => part.hit));
    }

    private calculateNearByPositions(
        x: number,
        y: number,
        direction: boolean,
        size: number
    ): Position[] {
        const positions: Position[] = [];

        const shipStart: Position = { x, y };
        const shipEnd: Position = {
            x: direction ? x : x + size - 1,
            y: direction ? y + size - 1 : y,
        };

        const nearByStart: Position = { x: x - 1, y: y - 1 };
        const nearByEnd: Position = {
            x: direction ? x + 1 : x + size,
            y: direction ? y + size : y + 1,
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

    public toString(): string {
        const formattedParts: string[] = this.parts.map(
            (part) => `${part.x}/${part.y}:${part.hit ? "hit" : ""}`
        );
        return formattedParts.join(";") + `-destroyed:${this.destroyed}`;
    }
}
