import { CreateGamePayload, JoinRoomPayload, PlayerId } from "../types.js";
import { joinRoom, getPlayerById, getRoomById, createGame } from "../state.js";
import { sendRoomsUpdate } from "../pub.js";
import { Room } from "../Room.js";
import { Game } from "../Game.js";
import { Player } from "../Player.js";
import { GameServer } from "../server.js";

function joinRoomHandler(server: GameServer, playerId: PlayerId, payload: JoinRoomPayload) {
    const roomId = payload.indexRoom;
    const currentPlayer: Player = getPlayerById(playerId) as Player;

    const isJoinedToRoom: boolean = joinRoom(roomId, currentPlayer);
    if (isJoinedToRoom) {
        const room = getRoomById(roomId) as Room;
        let game: Game;
        if (room.hasGame()) {
            game = room.getGame() as Game;
        } else {
            game = createGame();
            room.assignGame(game);
        }
        const payload: CreateGamePayload = {
            idGame: game.id,
            idPlayer: playerId,
        };
        sendCreateGame(server, playerId, payload);
        sendRoomsUpdate(server, "others");
    }
}

function sendCreateGame(server: GameServer, playerId: PlayerId, payload: CreateGamePayload): void {
    server.sendMessageToPlayer(playerId, "create_game", payload);
}

export { joinRoomHandler };
