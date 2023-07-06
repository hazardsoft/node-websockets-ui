import { RoomId } from "./types.js";
import { Player } from "./Player.js";
import { Game } from "./Game.js";

export class Room {
    private players: Player[] = [];
    private game: Game | null = null;

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

    public assignGame(game: Game): void {
        this.game = game;
    }

    public removeGame(): void {
        this.game = null;
    }

    public hasGame(): boolean {
        return !!this.game;
    }

    public getGame(): Game | null {
        return this.game;
    }
}
