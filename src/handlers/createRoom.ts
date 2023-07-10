import { GameServer, MessageHandler } from "../server.js";
import { createRoom } from "../state.js";
import { JoinRoomPayload, PlayerId } from "../types.js";
import { joinRoomHandler } from "./joinRoom.js";

const createRoomHandler: MessageHandler = (
    server: GameServer,
    _,
    currentPlayerId: PlayerId
): void => {
    const room = createRoom();
    joinRoomHandler(server, _, currentPlayerId, <JoinRoomPayload>{
        indexRoom: room.id,
    });
};

export { createRoomHandler };
