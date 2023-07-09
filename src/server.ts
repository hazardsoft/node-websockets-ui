import { IncomingMessage } from "http";
import { WebSocket, WebSocketServer, AddressInfo } from "ws";
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
    RandomAttackPayload,
} from "./types.js";
import { loginHandler } from "./handlers/login.js";
import { joinRoomHandler } from "./handlers/joinRoom.js";
import { attackHandler } from "./handlers/attack.js";
import { addShipsHandler } from "./handlers/addShips.js";
import { sendRoomsUpdateHandler } from "./handlers/updateRooms.js";
import { randomAttackHandler } from "./handlers/randomAttack.js";

export class GameServer {
    private connections: Map<PlayerId, WebSocket> = new Map();
    private wss: WebSocketServer;

    constructor(port: number) {
        this.wss = new WebSocketServer({ port });

        const { address, port:p, family } = this.wss.address() as AddressInfo;
        console.log(
            `WebSocket server is up and running: address ${address}, port ${p}, family ${family}}`
        );

        this.wss.on("connection", (ws: WebSocket, req: IncomingMessage): void => {
            ws.on("error", (error: Error) => {
                console.error(error);
            });
            ws.on("close", () => {
                this.removeConnection(ws);
            });

            ws.on("message", (data: Buffer | ArrayBuffer | Buffer[], isBinary: boolean) => {
                console.log("-> inbound message %s", data);

                const str: string = data.toString();
                const message: Message = JSON.parse(str);
                const parsedData: Record<string, unknown> =
                    message.data && message.data.length ? JSON.parse(message.data) : null;
                switch (message.type) {
                    case "reg":
                        loginHandler(this, ws, <LoginPayload>parsedData, (playerId: PlayerId) => {
                            this.setConnectionByPlayerId(playerId, ws);
                        });
                        break;
                    case "create_room":
                        createRoom();
                        sendRoomsUpdateHandler(this, "all");
                        break;
                    case "add_user_to_room":
                        const playerId = this.getPlayerIdByConnection(ws);
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
                    case "randomAttack":
                        randomAttackHandler(this, <RandomAttackPayload>parsedData);
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
        console.log(`outbound message -> `, message);
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
                this.connections.forEach((connection: WebSocket) => {
                    this.sendMessage(connection, messageType, payload);
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

    private setConnectionByPlayerId(playerId: PlayerId, connection: WebSocket): void {
        this.connections.set(playerId, connection);
    }

    private getConnectionByPlayerId(playerId: string): WebSocket | undefined {
        return this.connections.get(playerId);
    }

    private getPlayerIdByConnection(ws: WebSocket): PlayerId | undefined {
        for (const [playerId, connection] of this.connections.entries()) {
            if (connection === ws) {
                return playerId;
            }
        }
        return undefined;
    }

    private removeConnection(ws: WebSocket): void {
        for (const [playerId, connection] of this.connections.entries()) {
            if (connection === ws) {
                console.log(`player ${playerId} disconnected from the server`);
                this.connections.delete(playerId);
            }
        }
    }
}
