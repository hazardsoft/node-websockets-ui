import { CreateGamePayload, JoinRoomPayload, MessageType, PlayerId } from "../types.js";
import { joinRoom, getPlayerById, getRoomById, createGame } from "../state.js";
import { sendRoomsUpdateHandler } from "./updateRooms.js";
import { Room } from "../model/Room.js";
import { Game } from "../model/Game.js";
import { Player } from "../model/Player.js";
import { GameServer } from "../server.js";

const commandName: MessageType = "create_game";

function joinRoomHandler(server: GameServer, playerId: PlayerId, payload: JoinRoomPayload) {
    const roomId = payload.indexRoom;
    const currentPlayer: Player = getPlayerById(playerId) as Player;

    const joined: boolean = joinRoom(roomId, currentPlayer);
    if (joined) {
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
        sendRoomsUpdateHandler(server, "all");
    }
}

export { joinRoomHandler };
