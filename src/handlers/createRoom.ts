import { GameServer } from "../server.js";
import { createRoom } from "../state.js";
import { JoinRoomPayload, PlayerId } from "../types.js";
import { joinRoomHandler } from "./joinRoom.js";

function createRoomHandler(server: GameServer, playerId: PlayerId): void {
    const room = createRoom();
    joinRoomHandler(server, playerId, <JoinRoomPayload>{
        indexRoom: room.id,
    });
}

export { createRoomHandler };
