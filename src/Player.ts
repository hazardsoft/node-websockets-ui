import { PlayerId } from "./types.js";

export class Player {
    constructor(public id: PlayerId, public name: string, public password: string) {}
}
