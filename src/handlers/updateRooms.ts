import {
    NotificationType,
    UpdateRoomsPayload,
    Room,
    RoomUser,
    PlayerId,
    MessageType,
} from "../types.js";
import { Room as InternalRoom } from "../model/Room.js";
import { getPlayerById, getRooms } from "../state.js";
import { GameServer } from "../server.js";

const commandName: MessageType = "update_room";

function sendRoomsUpdateHandler(
    server: GameServer,
    notificationType: NotificationType,
    playerId?: PlayerId
): void {
    const rooms: InternalRoom[] = getRooms().filter((room) => !room.isFull());
    const payload: UpdateRoomsPayload = rooms.map((room: InternalRoom) => {
        return <Room>{
            roomId: room.id,
            roomUsers: room.getPlayers().map((playerId: PlayerId) => {
                const player = getPlayerById(playerId);
                return <RoomUser>{ name: player?.name, index: player?.id };
            }),
        };
    });
    server.sendNotification(commandName, payload, notificationType, playerId);
}

export { sendRoomsUpdateHandler };
