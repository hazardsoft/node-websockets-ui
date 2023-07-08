import { PlayerId, Position } from "./types.js";
import { AttackResult, Ship } from "./types.js";
import { Field, OpponentField } from "./Field.js";

type PlayerFields = {
    player: Field;
    opponent: OpponentField;
};

export class Game {
    private fields: Map<PlayerId, PlayerFields> = new Map();
    private turnOfPlayerId: PlayerId = "";

    constructor(public id: string) {}

    public setShipsByPlayerId(playerId: PlayerId, ships: Ship[]): void {
        if (!this.fields.has(playerId)) {
            this.fields.set(playerId, { player: new Field(), opponent: new OpponentField() });
        }
        const fields: PlayerFields | undefined = this.fields.get(playerId);
        if (fields) {
            fields.player.setShips(ships);
        }
    }

    public getShipsByPlayerId(playerId: PlayerId): Ship[] | undefined {
        const fields: PlayerFields | undefined = this.fields.get(playerId);
        if (fields) {
            return fields.player.getShips();
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
            const field: PlayerFields = this.fields.get(playerId) as PlayerFields;
            return field.player.attack(x, y);
        }
        return undefined;
    }

    public setAttackResultOnOpponentField(
        playerId: PlayerId,
        x: number,
        y: number,
        attackResult: AttackResult
    ): void {
        const fields: PlayerFields | undefined = this.fields.get(playerId);
        if (fields) {
            fields.opponent.markCell(x, y, attackResult);
        }
    }

    public getRandomPositionToAttack(playerId: PlayerId): Position {
        const fields: PlayerFields | undefined = this.fields.get(playerId) as PlayerFields;
        return fields.opponent.getRandomPositionToAttack();
    }

    public isGameFinished(): boolean {
        for (const fields of this.fields.values()) {
            if (fields.player.isAllShipsDestroyed()) {
                return true;
            }
        }
        return false;
    }
}
