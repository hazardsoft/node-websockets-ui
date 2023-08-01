import { PlayerId, RoomId } from "../types.js";

const MAX_NUMBER_OF_PLAYERS = 2;

export class Room {
    private playerIds: PlayerId[] = [];

    constructor(public id: RoomId) {}

    public addPlayer(id: PlayerId): void {
        this.playerIds.push(id);
    }

    public getPlayers(): PlayerId[] {
        return this.playerIds.slice();
    }

    public removePlayers(): void {
        this.playerIds.length = 0;
    }

    public isEmpty(): boolean {
        return this.playerIds.length === 0;
    }

    public isFull(): boolean {
        return this.playerIds.length == MAX_NUMBER_OF_PLAYERS;
    }

    public toString(): string {
        return `Room #${this.id}: players ${this.playerIds}`;
    }
}
