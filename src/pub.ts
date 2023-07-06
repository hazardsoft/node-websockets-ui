import { WebSocketServer, WebSocket } from "ws";
import {
    Message,
    MessageType,
    NotificationType,
    UpdateRoomsPayload,
    Room,
    RoomUser,
} from "./types.js";
import { Room as InternalRoom } from "./Room.js";
import { Player as InternalPlayer } from "./Player.js";
import { getRooms } from "./state.js";

function sendNotification(
    wss: WebSocketServer,
    ws: WebSocket,
    type: MessageType,
    data: any,
    notificationType: NotificationType
): void {
    switch (notificationType) {
        case "all":
            wss.clients.forEach((client: WebSocket) => {
                sendMessage(client, type, data);
            });
            break;
        case "self":
            sendMessage(ws, type, data);
            break;
        case "others":
            wss.clients.forEach((client: WebSocket) => {
                if (client !== ws) {
                    sendMessage(client, type, data);
                }
            });
            break;
    }
}

function sendMessage(ws: WebSocket, type: MessageType, data: any): void {
    const message: Message = {
        type,
        data: data ? JSON.stringify(data) : "",
        id: 0,
    };
    console.log(" -> sending message:");
    console.log(message);
    ws.send(JSON.stringify(message));
}

function sendRoomsUpdate(
    wss: WebSocketServer,
    ws: WebSocket,
    notificationType: NotificationType
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
    sendNotification(wss, ws, "update_room", payload, notificationType);
}

export { sendMessage, sendNotification, sendRoomsUpdate };
