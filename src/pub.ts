import { NotificationType, UpdateRoomsPayload, Room, RoomUser, PlayerId } from "./types.js";
import { Room as InternalRoom } from "./Room.js";
import { Player as InternalPlayer } from "./Player.js";
import { getRooms } from "./state.js";
import { GameServer } from "./server.js";

function sendRoomsUpdate(
    gameServer: GameServer,
    notificationType: NotificationType,
    playerId?: PlayerId
): void {
    const rooms: InternalRoom[] = getRooms();
    const payload: UpdateRoomsPayload = rooms.map((room: InternalRoom) => {
        return <Room>{
            roomId: room.id,
            roomUsers: room
                .getPlayers()
                .map((player: InternalPlayer) => <RoomUser>{ name: player.name, index: player.id }),
        };
    });
    gameServer.sendNotification("update_room", payload, notificationType, playerId);
}

export { sendRoomsUpdate };
