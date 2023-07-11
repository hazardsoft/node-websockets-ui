import { randomUUID } from "crypto";
import { Player } from "./Player.js";

let botIndex: number = 0;

export class BotPlayer extends Player {
    constructor() {
        super(randomUUID(), `bot#${botIndex++}`, "");
    }

    public toString(): string {
        return `Bot: ${super.toString()}`;
    }
}
