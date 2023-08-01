import { CreateGamePayload, JoinRoomPayload, MessageType, MessageHandler } from "../types.js";
import {
    joinRoom,
    getRoomById,
    createGame,
    hasGameInRoom,
    getGameByRoom,
    setGameInRoom,
} from "../state.js";
import { sendRoomsUpdateHandler } from "./updateRooms.js";

const commandName: MessageType = "create_game";

const joinRoomHandler: MessageHandler = (context, payload): void => {
    const { indexRoom: roomId } = payload as JoinRoomPayload;

    const joined: boolean = joinRoom(roomId, context.currentPlayerId!);
    if (joined) {
        const room = getRoomById(roomId)!;
        const game = hasGameInRoom(room) ? getGameByRoom(room)! : createGame();
        setGameInRoom(room, game);
        context.server.sendMessageToPlayer(context.currentPlayerId!, commandName, <
            CreateGamePayload
        >{
            idGame: game.id,
            idPlayer: context.currentPlayerId,
        });
        sendRoomsUpdateHandler(context.server, "all");
    }
};

export { joinRoomHandler };
