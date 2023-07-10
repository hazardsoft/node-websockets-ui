import { RoomId } from "../types.js";
import { Player } from "./Player.js";

const MAX_NUMBER_OF_PLAYERS = 2;

export class Room {
    private players: Player[] = [];

    constructor(public id: RoomId) {}

    public addPlayer(player: Player): void {
        this.players.push(player);
    }

    public getPlayers(): Player[] {
        return this.players.slice();
    }

    public removePlayers(): void {
        this.players.length = 0;
    }

    public isEmpty(): boolean {
        return this.players.length === 0;
    }

    public isFull(): boolean {
        return this.players.length == MAX_NUMBER_OF_PLAYERS;
    }
}
