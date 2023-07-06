import { CreateGamePayload, JoinRoomPayload, MessageType, PlayerId } from "../types.js";
import { joinRoom, getPlayerById, getRoomById, createGame } from "../state.js";
import { sendRoomsUpdateHandler } from "./updateRooms.js";
import { Room } from "../Room.js";
import { Game } from "../Game.js";
import { Player } from "../Player.js";
import { GameServer } from "../server.js";

const commandName: MessageType = "create_game";

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
        server.sendMessageToPlayer(playerId, commandName, <CreateGamePayload>{
            idGame: game.id,
            idPlayer: playerId,
        });
        sendRoomsUpdateHandler(server, "others");
    } else {
        sendRoomsUpdateHandler(server, "self", playerId);
    }
}

export { joinRoomHandler };
