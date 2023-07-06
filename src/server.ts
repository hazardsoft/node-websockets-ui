import { IncomingMessage } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { createRoom } from "./state.js";
import {
    LoginPayload,
    Message,
    JoinRoomPayload,
    PlayerId,
    AddShipsPayload,
    AttackPayload,
    MessageType,
    NotificationType,
} from "./types.js";
import { loginHandler } from "./handlers/login.js";
import { joinRoomHandler } from "./handlers/joinRoom.js";
import { attackHandler } from "./handlers/attack.js";
import { addShipsHandler } from "./handlers/addShips.js";
import { sendRoomsUpdateHandler } from "./handlers/updateRooms.js";

export class GameServer {
    private connections: Map<WebSocket, PlayerId> = new Map();
    private wss: WebSocketServer;

    constructor(port: number) {
        this.wss = new WebSocketServer({ port });

        this.wss.on("connection", (ws: WebSocket, req: IncomingMessage): void => {
            console.log("wss: connection event");

            ws.on("error", (error: Error) => {
                console.error(error);
            });
            ws.on("close", () => {
                console.log("ws connection closed by client");
                this.connections.delete(ws);
            });

            ws.on("message", (data: Buffer | ArrayBuffer | Buffer[], isBinary: boolean) => {
                console.log("received: %s", data);

                const str: string = data.toString();
                const message: Message = JSON.parse(str);
                const parsedData: Record<string, unknown> =
                    message.data && message.data.length ? JSON.parse(message.data) : null;
                switch (message.type) {
                    case "reg":
                        loginHandler(this, ws, <LoginPayload>parsedData, (playerId: PlayerId) => {
                            this.setPlayerId(ws, playerId);
                        });
                        break;
                    case "create_room":
                        createRoom();
                        sendRoomsUpdateHandler(this, "all");
                        break;
                    case "add_user_to_room":
                        const playerId = this.getPlayerId(ws);
                        if (playerId) {
                            joinRoomHandler(this, playerId, <JoinRoomPayload>parsedData);
                        }
                        break;
                    case "add_ships":
                        addShipsHandler(this, <AddShipsPayload>parsedData);
                        break;
                    case "attack":
                        attackHandler(this, <AttackPayload>parsedData);
                        break;
                }
            });
        });
    }

    public sendMessageToPlayer(playerId: PlayerId, messageType: MessageType, payload: any): void {
        const connection = this.getConnectionByPlayerId(playerId);
        if (connection) {
            this.sendMessage(connection, messageType, payload);
        }
    }

    public sendMessage(connection: WebSocket, messageType: MessageType, payload: any): void {
        const message: Message = {
            type: messageType,
            data: payload ? JSON.stringify(payload) : "",
        };
        connection.send(JSON.stringify(message));
    }

    public sendNotification(
        messageType: MessageType,
        payload: any,
        notificationType: NotificationType,
        fromPlayerId?: PlayerId
    ): void {
        const connection = fromPlayerId ? this.getConnectionByPlayerId(fromPlayerId) : null;
        switch (notificationType) {
            case "all":
                this.wss.clients.forEach((client: WebSocket) => {
                    this.sendMessage(client, messageType, payload);
                });
                break;
            case "self":
                connection && this.sendMessage(connection, messageType, payload);
                break;
            case "others":
                this.wss.clients.forEach((client: WebSocket) => {
                    if (client !== connection) {
                        this.sendMessage(client, messageType, payload);
                    }
                });
                break;
        }
    }

    private getConnectionByPlayerId(playerId: string): WebSocket | undefined {
        for (const [ws, id] of this.connections.entries()) {
            if (id === playerId) {
                return ws;
            }
        }
        return undefined;
    }

    private getPlayerId(ws: WebSocket): PlayerId | undefined {
        return this.connections.get(ws);
    }

    public setPlayerId(ws: WebSocket, playerId: PlayerId): void {
        this.connections.set(ws, playerId);
    }
}
