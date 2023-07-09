import {
    NotificationType,
    UpdateRoomsPayload,
    Room,
    RoomUser,
    PlayerId,
    MessageType,
} from "../types.js";
import { Room as InternalRoom } from "../Room.js";
import { Player as InternalPlayer } from "../Player.js";
import { getRooms } from "../state.js";
import { GameServer } from "../server.js";

const commandName: MessageType = "update_room";

function sendRoomsUpdateHandler(
    gameServer: GameServer,
    notificationType: NotificationType,
    playerId?: PlayerId
): void {
    const rooms: InternalRoom[] = getRooms().filter((room) => !room.isFull());
    const payload: UpdateRoomsPayload = rooms.map((room: InternalRoom) => {
        return <Room>{
            roomId: room.id,
            roomUsers: room
                .getPlayers()
                .map((player: InternalPlayer) => <RoomUser>{ name: player.name, index: player.id }),
        };
    });
    gameServer.sendNotification(commandName, payload, notificationType, playerId);
}

export { sendRoomsUpdateHandler };
