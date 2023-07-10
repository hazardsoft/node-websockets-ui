import { IncomingMessage } from "http";
import { WebSocket, WebSocketServer, AddressInfo } from "ws";
import { getActivePlayers, removeActivePlayer } from "./state.js";
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
import { randomAttackHandler } from "./handlers/randomAttack.js";
import { createRoomHandler } from "./handlers/createRoom.js";
import { forceFinishGameHandler } from "./handlers/forceFinish.js";

export class GameServer {
    private connections: Map<PlayerId, WebSocket> = new Map();
    private wss: WebSocketServer;

    constructor(port: number) {
        this.wss = new WebSocketServer({ port });

        const { address, port: p, family } = this.wss.address() as AddressInfo;
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
                        loginHandler(this, ws, <LoginPayload>parsedData);
                        break;
                    case "create_room":
                        const playerId = this.getPlayerIdByConnection(ws);
                        if (playerId) {
                            createRoomHandler(this, playerId);
                        }
                        break;
                    case "add_user_to_room":
                        const addPlayerId = this.getPlayerIdByConnection(ws);
                        if (addPlayerId) {
                            joinRoomHandler(this, addPlayerId, <JoinRoomPayload>parsedData);
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
            id: 0,
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
        switch (notificationType) {
            case "all":
                getActivePlayers().forEach((player) => {
                    this.sendMessageToPlayer(player.id, messageType, payload);
                });
                break;
            case "self":
                if (fromPlayerId) {
                    this.sendMessageToPlayer(fromPlayerId, messageType, payload);
                }
                break;
            case "others":
                getActivePlayers().forEach((player) => {
                    if (fromPlayerId !== player.id) {
                        this.sendMessageToPlayer(player.id, messageType, payload);
                    }
                });
                break;
        }
    }

    public setConnectionByPlayerId(playerId: PlayerId, connection: WebSocket): void {
        this.connections.set(playerId, connection);
    }

    public getConnectionByPlayerId(playerId: string): WebSocket | undefined {
        return this.connections.get(playerId);
    }

    public getPlayerIdByConnection(ws: WebSocket): PlayerId | undefined {
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
                removeActivePlayer(playerId);
                forceFinishGameHandler(this, playerId);
            }
        }
    }
}
