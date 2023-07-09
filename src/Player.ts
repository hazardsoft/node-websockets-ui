import { PlayerId } from "./types.js";

export class Player {
    public wins: number = 0;
    constructor(public id: PlayerId, public name: string, public password: string) {}
}
