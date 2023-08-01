import { PlayerId } from "../types.js";

export class Player {
    constructor(public id: PlayerId, public name: string, public password: string) {}

    public toString(): string {
        return `Player: id ${this.id}, name ${this.name}`;
    }
}
