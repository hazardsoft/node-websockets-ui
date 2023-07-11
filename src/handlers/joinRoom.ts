import { CreateGamePayload, JoinRoomPayload, MessageType, PlayerId } from "../types.js";
import {
    joinRoom,
    getPlayerById,
    getRoomById,
    createGame,
    hasGameInRoom,
    getGameByRoom,
    setGameInRoom,
} from "../state.js";
import { sendRoomsUpdateHandler } from "./updateRooms.js";
import { Room } from "../model/Room.js";
import { Game } from "../model/Game.js";
import { Player } from "../model/Player.js";
import { GameServer, MessageHandler } from "../server.js";

const commandName: MessageType = "create_game";

const joinRoomHandler: MessageHandler = (
    server: GameServer,
    _,
    currentPlayerId: PlayerId,
    payload: JoinRoomPayload
): void => {
    const roomId = payload.indexRoom;
    const currentPlayer: Player = getPlayerById(currentPlayerId) as Player;

    const joined: boolean = joinRoom(roomId, currentPlayer);
    if (joined) {
        const room = getRoomById(roomId) as Room;
        const game = hasGameInRoom(room) ? (getGameByRoom(room) as Game) : createGame();
        setGameInRoom(room, game);
        server.sendMessageToPlayer(currentPlayerId, commandName, <CreateGamePayload>{
            idGame: game.id,
            idPlayer: currentPlayerId,
        });
        sendRoomsUpdateHandler(server, "all");
    }
};

export { joinRoomHandler };
