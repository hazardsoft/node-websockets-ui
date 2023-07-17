import { GameId, PlayerId, RoomId } from "../types.js";

let playerIndex = 0;
let roomIndex = 0;
let gameIndex = 0;

export function generatePlayerId(): PlayerId {
    return ++playerIndex;
}

export function generateRoomId(): RoomId {
    return ++roomIndex;
}

export function generateGameId(): GameId {
    return ++gameIndex;
}
