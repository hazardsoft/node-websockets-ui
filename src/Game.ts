import { PlayerId } from "./types.js";
import { AttackResult, Ship } from "./types.js";
import { Field } from "./Field.js";

export class Game {
    private fields: Map<PlayerId, Field> = new Map();
    private turnOfPlayerId: PlayerId = "";

    constructor(public id: string) {}

    public setShipsByPlayerId(playerId: PlayerId, ships: Ship[]): void {
        if (!this.fields.has(playerId)) {
            this.fields.set(playerId, new Field());
        }
        const field: Field | undefined = this.fields.get(playerId);
        if (field) {
            field.setShips(ships);
        }
    }

    public getShipsByPlayerId(playerId: PlayerId): Ship[] | undefined {
        const field: Field | undefined = this.fields.get(playerId);
        if (field) {
            return field.getShips();
        }
        return undefined;
    }

    public setTurn(playerId: PlayerId): void {
        this.turnOfPlayerId = playerId;
    }

    public getTurn(): PlayerId {
        return this.turnOfPlayerId;
    }

    public isGameReadyToStart(): boolean {
        return this.fields.size === 2;
    }

    public getPlayersIds(): PlayerId[] {
        const playersIds: PlayerId[] = [];
        for (const playerId of this.fields.keys()) {
            playersIds.push(playerId);
        }
        return playersIds;
    }

    public getOpponentId(attackerId: PlayerId): PlayerId | undefined {
        for (const playerId of this.fields.keys()) {
            if (playerId !== attackerId) {
                return playerId;
            }
        }
        return undefined;
    }

    public attackPlayer(playerId: PlayerId, x: number, y: number): AttackResult | undefined {
        if (this.fields.has(playerId)) {
            const field = this.fields.get(playerId) as Field;
            return field.attack(x, y);
        }
        return undefined;
    }
}
