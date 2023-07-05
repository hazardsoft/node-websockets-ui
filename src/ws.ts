import { IncomingMessage } from "http";
import { WebSocket, WebSocketServer } from "ws";
import {
    addPlayer,
    createRoom,
    getRooms,
    joinRoom,
    InternalPlayer,
    InternalRoom,
} from "./state.js";

type MessageType = "reg" | "create_room" | "update_room" | "add_user_to_room";
type ResponsePayload = Record<string, unknown> | null;

type Message = {
    type: MessageType;
    data: string;
    id: number;
};

type RegPayload = {
    name: string;
    password: string;
};

type JoinRoomPayload = {
    indexRoom: string;
};

type RegResponse = {
    name: string;
    error: boolean;
    errorText: string;
};

type RoomUser = {
    name: string;
    index: string;
};
type Room = {
    roomId: string;
    roomUsers: RoomUser[];
};

type UpdateRoomsNotification = Room[];

function createWenSocketServer(port: number): WebSocketServer {
    const wss = new WebSocketServer({ port });

    wss.on("connection", (ws: WebSocket, req: IncomingMessage): void => {
        console.log("wss: connection event");

        ws.on("error", (error: Error) => {
            console.error(error);
        });
        ws.on("close", () => console.log("ws connection closed by client"));

        ws.on("message", (data: Buffer | ArrayBuffer | Buffer[], isBinary: boolean) => {
            const str: string = data.toString();
            const message: Message = JSON.parse(str);
            const parsedData: Record<string, unknown> =
                message.data && message.data.length ? JSON.parse(message.data) : null;
            switch (message.type) {
                case "reg":
                    const regPayload: RegPayload = parsedData as RegPayload;
                    const isPlayerAdded: boolean = addPlayer(<InternalPlayer>{
                        name: regPayload.name,
                        password: regPayload.password,
                    });
                    sendLoginResponse(
                        ws,
                        message,
                        regPayload,
                        !isPlayerAdded ? "Player exists already" : ""
                    );
                    sendRoomsUpdate(wss, ws, true);
                    break;
                case "create_room":
                    createRoom();
                    sendRoomsUpdate(wss, ws);
                    break;
                case "add_user_to_room":
                    const joinRoomPayload: JoinRoomPayload = parsedData as JoinRoomPayload;
                    const isJoinedToRoom: boolean = joinRoom(joinRoomPayload.indexRoom);
                    sendRoomsUpdate(wss, ws);
                    break;
            }
            console.log("received: %s", data);
        });
    });

    return wss;
}

function sendLoginResponse(
    ws: WebSocket,
    message: Message,
    payload: RegPayload,
    errorMessage: string
): void {
    sendMessage(
        ws,
        message.type,
        <RegResponse>{
            name: payload.name,
            error: errorMessage && errorMessage.length > 0,
            errorText: errorMessage,
        },
        message.id
    );
}

function sendRoomsUpdate(wss: WebSocketServer, ws: WebSocket, self: boolean = false): void {
    const rooms: InternalRoom[] = getRooms();
    const notification: UpdateRoomsNotification = rooms.map((room: InternalRoom) => {
        return <Room>{
            roomId: room.id,
            roomUsers: room.players.map(
                (player: InternalPlayer) => <RoomUser>{ name: player.name, index: player.id }
            ),
        };
    });
    if (self) {
        sendMessage(ws, "update_room", notification, 0);
    } else {
        wss.clients.forEach((client: WebSocket) => {
            sendMessage(client, "update_room", notification, 0);
        });
    }
}

function sendMessage(ws: WebSocket, type: MessageType, data: any, id: number): void {
    const message: Message = {
        type,
        data: data ? JSON.stringify(data) : "",
        id,
    };
    console.log(" -> sending message:");
    console.log(message);
    ws.send(JSON.stringify(message));
}

export { createWenSocketServer, Room, RoomUser };
