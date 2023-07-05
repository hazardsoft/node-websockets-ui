import { IncomingMessage } from "http";
import { WebSocket, WebSocketServer } from "ws";
import {
    addPlayer,
    createRoom,
    getRooms,
    joinRoom,
    InternalPlayer,
    InternalRoom,
    InternalGame,
    createGameInRoom,
    getRoomById,
    getPlayerById,
    getGameById,
    isGameReadyToStart,
    setShips,
} from "./state.js";

type MessageType =
    | "reg"
    | "create_room"
    | "update_room"
    | "add_user_to_room"
    | "create_game"
    | "add_ships"
    | "start_game";
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

type Ship = {
    position: { x: number; y: number };
    direction: boolean;
    length: 4;
    type: "small" | "medium" | "large" | "huge";
};

type AddShipsPayload = {
    gameId: string;
    indexPlayer: string;
    ships: Ship[];
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

type StartGamePayload = {
    currentPlayerIndex: string;
    ships: Ship[];
};

type UpdateRoomsPayload = Room[];
type PlayerId = string;
type NotificationType = "all" | "self" | "others";

function createWenSocketServer(port: number): WebSocketServer {
    const connections: Map<WebSocket, PlayerId> = new Map();

    const getWsByPlayerId = (playerId: string): WebSocket | undefined => {
        for (const [ws, id] of connections.entries()) {
            if (id === playerId) {
                return ws;
            }
        }
        return undefined;
    };

    const wss = new WebSocketServer({ port });

    wss.on("connection", (ws: WebSocket, req: IncomingMessage): void => {
        console.log("wss: connection event");
        let currentPlayerId: string;
        let currentPlayer: InternalPlayer;

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
                    const newPlayer = addPlayer({ name, password });
                    if (newPlayer) {
                        connections.set(ws, newPlayer.id);
                    }
                    sendLoginResponse(
                        ws,
                        message,
                        newPlayer ?? null,
                        newPlayer ? "" : "Player exists already"
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
                    currentPlayerId = connections.get(ws) as string;
                    currentPlayer = getPlayerById(currentPlayerId) as InternalPlayer;
                    const isJoinedToRoom: boolean = joinRoom(roomId, currentPlayer);
                    if (isJoinedToRoom) {
                        const room = getRoomById(roomId) as InternalRoom;
                        const game: InternalGame = room.game || createGameInRoom(room);
                        const payload: CreateGamePayload = {
                            idGame: game.id,
                            idPlayer: currentPlayerId,
                        };
                        sendCreateGame(ws, payload);
                        sendRoomsUpdate(wss, ws, "others");
                    }
                    break;
                case "add_ships":
                    const { gameId, indexPlayer, ships } = parsedData as AddShipsPayload;
                    setShips(gameId, indexPlayer, ships);

                    const game: InternalGame = getGameById(gameId) as InternalGame;
                    if (isGameReadyToStart(game)) {
                        game.playersShips.forEach((ships: Ship[], player: InternalPlayer) => {
                            const payload: StartGamePayload = {
                                currentPlayerIndex: player.id,
                                ships,
                            };
                            const playerWs = getWsByPlayerId(player.id) as WebSocket;
                            sendStartGame(playerWs, payload);
                        });
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

function sendStartGame(ws: WebSocket, payload: StartGamePayload): void {
    sendMessage(ws, "start_game", payload, 0);
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
            roomUsers: room.players.map(
                (player: InternalPlayer) => <RoomUser>{ name: player.name, index: player.id }
            ),
        };
    });
    sendNotification(wss, ws, "update_room", payload, notificationType);
}

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
                sendMessage(client, type, data, 0);
            });
            break;
        case "self":
            sendMessage(ws, type, data, 0);
            break;
        case "others":
            wss.clients.forEach((client: WebSocket) => {
                if (client !== ws) {
                    sendMessage(client, type, data, 0);
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

export { createWenSocketServer, Room, RoomUser, RegPayload, Ship };
