import { WebSocket, WebSocketServer } from "ws";
import { CreateGamePayload, JoinRoomPayload, PlayerId } from "../types.js";
import { joinRoom, getPlayerById, getRoomById, createGameInRoom } from "../state.js";
import { sendMessage, sendRoomsUpdate } from "../pub.js";
import { Room } from "../Room.js";
import { Game } from "../Game.js";
import { Player } from "../Player.js";

function joinRoomHandler(
    wss: WebSocketServer,
    ws: WebSocket,
    payload: JoinRoomPayload,
    getCurrentPlayerId: () => PlayerId
) {
    const roomId: string = payload.indexRoom;
    const currentPlayerId: PlayerId = getCurrentPlayerId();
    const currentPlayer: Player = getPlayerById(currentPlayerId) as Player;

    const isJoinedToRoom: boolean = joinRoom(roomId, currentPlayer);
    if (isJoinedToRoom) {
        const room = getRoomById(roomId) as Room;
        const game: Game = room.hasGame() ? (room.getGame() as Game) : createGameInRoom(room);
        const payload: CreateGamePayload = {
            idGame: game.id,
            idPlayer: currentPlayerId,
        };
        sendCreateGame(ws, payload);
        sendRoomsUpdate(wss, ws, "others");
    }
}

function sendCreateGame(ws: WebSocket, payload: CreateGamePayload): void {
    sendMessage(ws, "create_game", payload);
}

export { joinRoomHandler };
