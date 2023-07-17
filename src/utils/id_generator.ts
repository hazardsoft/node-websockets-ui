import { randomUUID } from "crypto";
import { GameId, PlayerId, RoomId } from "../types.js";

export function generatePlayerId(): PlayerId {
    return randomUUID();
}

export function generateRoomId(): RoomId {
    return randomUUID();
}

export function generateGameId(): GameId {
    return randomUUID();
}
