import { IncomingMessage } from "http";
import { WebSocket, WebSocketServer } from "ws";
import {
    addPlayer,
    createRoom,
    getRooms,
    joinRoom,
    InternalPlayer,
    InternalRoom,
    createGameInRoomForPlayer,
    getRoomById,
    getPlayerById,
} from "./state.js";

type MessageType = "reg" | "create_room" | "update_room" | "add_user_to_room" | "create_game";
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

type CreateGamePayload = {
    idGame: string;
    idPlayer: string;
};

type JoinRoomPayload = {
    indexRoom: string;
};

type RegResponse = {
    name: string;
    index: string;
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
type PlayerId = string;
type NotificationType = "all" | "self" | "others";

function createWenSocketServer(port: number): WebSocketServer {
    const connections: Map<WebSocket, PlayerId> = new Map();

    const wss = new WebSocketServer({ port });

    wss.on("connection", (ws: WebSocket, req: IncomingMessage): void => {
        console.log("wss: connection event");

        ws.on("error", (error: Error) => {
            console.error(error);
        });
        ws.on("close", () => {
            console.log("ws connection closed by client");
            connections.delete(ws);
        });

        ws.on("message", (data: Buffer | ArrayBuffer | Buffer[], isBinary: boolean) => {
            const str: string = data.toString();
            const message: Message = JSON.parse(str);
            const parsedData: Record<string, unknown> =
                message.data && message.data.length ? JSON.parse(message.data) : null;
            switch (message.type) {
                case "reg":
                    const { name, password } = parsedData as RegPayload;
                    const player: InternalPlayer | null = addPlayer(<InternalPlayer>{
                        name,
                        password,
                    });
                    if (player) {
                        connections.set(ws, player.id);
                    }
                    sendLoginResponse(
                        ws,
                        message,
                        player ?? null,
                        player ? "" : "Player exists already"
                    );

                    sendRoomsUpdate(wss, ws, "self");
                    break;
                case "create_room":
                    createRoom();
                    sendRoomsUpdate(wss, ws, "all");
                    break;
                case "add_user_to_room":
                    const joinRoomPayload: JoinRoomPayload = parsedData as JoinRoomPayload;
                    const roomId: string = joinRoomPayload.indexRoom;
                    const playerId: string | undefined = connections.get(ws);
                    if (playerId) {
                        const player: InternalPlayer | undefined = getPlayerById(
                            playerId
                        ) as InternalPlayer;
                        const isJoinedToRoom: boolean = joinRoom(roomId, player);
                        if (isJoinedToRoom) {
                            const room = getRoomById(roomId) as InternalRoom;
                            const gameId: string = createGameInRoomForPlayer(room, player);
                            sendCreateGame(ws, <CreateGamePayload>{
                                idGame: gameId,
                                idPlayer: player.id,
                            });
                            sendRoomsUpdate(wss, ws, "others");
                        }
                    }

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
    player: InternalPlayer | null,
    errorMessage: string
): void {
    sendMessage(
        ws,
        message.type,
        <RegResponse>{
            name: player?.name,
            index: player?.id,
            error: errorMessage && errorMessage.length > 0,
            errorText: errorMessage,
        },
        message.id
    );
}

function sendCreateGame(ws: WebSocket, payload: CreateGamePayload): void {
    sendMessage(ws, "create_game", payload, 0);
}

function sendRoomsUpdate(
    wss: WebSocketServer,
    ws: WebSocket,
    notificationType: NotificationType
): void {
    const rooms: InternalRoom[] = getRooms();
    const notification: UpdateRoomsNotification = rooms.map((room: InternalRoom) => {
        return <Room>{
            roomId: room.id,
            roomUsers: room.players.map(
                (player: InternalPlayer) => <RoomUser>{ name: player.name, index: player.id }
            ),
        };
    });
    switch (notificationType) {
        case "all":
            wss.clients.forEach((client: WebSocket) => {
                sendMessage(client, "update_room", notification, 0);
            });
            break;
        case "self":
            sendMessage(ws, "update_room", notification, 0);
            break;
        case "others":
            wss.clients.forEach((client: WebSocket) => {
                if (client !== ws) {
                    sendMessage(client, "update_room", notification, 0);
                }
            });
            break;
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

export { createWenSocketServer, Room, RoomUser, RegPayload };
