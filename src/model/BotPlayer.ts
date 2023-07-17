import { Player } from "./Player.js";
import { generatePlayerId } from "../utils/id_generator.js";

export class BotPlayer extends Player {
    constructor() {
        const id = generatePlayerId();
        super(id, `bot#${id}`, "");
    }

    public toString(): string {
        return `Bot: id ${this.id}, name ${this.name}`;
    }
}
