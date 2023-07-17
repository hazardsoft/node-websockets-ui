import { createRoom } from "../state.js";
import { JoinRoomPayload, MessageHandler } from "../types.js";
import { joinRoomHandler } from "./joinRoom.js";

const createRoomHandler: MessageHandler = (context): void => {
    const room = createRoom();
    joinRoomHandler(context, <JoinRoomPayload>{
        indexRoom: room.id,
    });
};

export { createRoomHandler };
