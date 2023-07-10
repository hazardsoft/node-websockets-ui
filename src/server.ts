import { IncomingMessage } from "http";
import { WebSocket, WebSocketServer, AddressInfo } from "ws";
import { getActivePlayers, removeActivePlayer } from "./state.js";
import { Message, PlayerId, MessageType, NotificationType } from "./types.js";
import { loginHandler } from "./handlers/login.js";
import { joinRoomHandler } from "./handlers/joinRoom.js";
import { attackHandler } from "./handlers/attack.js";
import { addShipsHandler } from "./handlers/addShips.js";
import { randomAttackHandler } from "./handlers/randomAttack.js";
import { createRoomHandler } from "./handlers/createRoom.js";
import { forceFinishGameHandler } from "./handlers/forceFinish.js";

type MessageHandler = (
    server: GameServer,
    connection: WebSocket,
    currentPlayerId: PlayerId,
    payload: any
) => void;

class GameServer {
    private connections: Map<PlayerId, WebSocket> = new Map();
    private wss: WebSocketServer;
    private handlers: Record<MessageType, MessageHandler | null> = {
        reg: loginHandler,
        create_room: createRoomHandler,
        add_user_to_room: joinRoomHandler,
        add_ships: addShipsHandler,
        attack: attackHandler,
        randomAttack: randomAttackHandler,

        create_game: null,
        start_game: null,
        turn: null,
        finish: null,
        update_room: null,
        update_winners: null,
    };

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

                const message: Message = JSON.parse(data.toString());
                const payload: Record<string, unknown> =
                    message.data && message.data.length ? JSON.parse(message.data) : null;
                const handler = this.handlers[message.type];
                if (handler) {
                    const currentPlayerId = this.getPlayerIdByConnection(ws);
                    handler(this, ws, currentPlayerId || "", payload);
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

export { GameServer, MessageHandler };
