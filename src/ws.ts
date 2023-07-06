import { IncomingMessage } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { createRoom, getGameById, setShips } from "./state.js";
import { Game as InternalGame } from "./Game.js";
import {
    LoginPayload,
    Message,
    JoinRoomPayload,
    PlayerId,
    AddShipsPayload,
    AttackPayload,
    TurnPayload,
    AttackResponsePayload,
} from "./types.js";
import { loginHandler } from "./handlers/login.js";
import { joinRoomHandler } from "./handlers/joinRoom.js";
import { startGameHandler } from "./handlers/startGame.js";
import { attackHandler } from "./handlers/attack.js";
import { sendMessage, sendRoomsUpdate } from "./pub.js";

function createWenSocketServer(port: number): WebSocketServer {
    const connections: Map<WebSocket, PlayerId> = new Map();

    const getConnection = (playerId: string): WebSocket | undefined => {
        for (const [ws, id] of connections.entries()) {
            if (id === playerId) {
                return ws;
            }
        }
        return undefined;
    };

    const getPlayerId = (ws: WebSocket): PlayerId | undefined => {
        return connections.get(ws);
    };

    const setPlayerId = (ws: WebSocket, playerId: PlayerId): void => {
        connections.set(ws, playerId);
    };

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
            console.log("received: %s", data);

            const str: string = data.toString();
            const message: Message = JSON.parse(str);
            const parsedData: Record<string, unknown> =
                message.data && message.data.length ? JSON.parse(message.data) : null;
            switch (message.type) {
                case "reg":
                    loginHandler(wss, ws, <LoginPayload>parsedData, (playerId: PlayerId) => {
                        setPlayerId(ws, playerId);
                    });
                    break;
                case "create_room":
                    createRoom();
                    sendRoomsUpdate(wss, ws, "all");
                    break;
                case "add_user_to_room":
                    joinRoomHandler(wss, ws, <JoinRoomPayload>parsedData, (): PlayerId => {
                        return getPlayerId(ws) as PlayerId;
                    });
                    break;
                case "add_ships":
                    const { gameId, indexPlayer, ships } = <AddShipsPayload>parsedData;
                    setShips(gameId, indexPlayer, ships);

                    const game: InternalGame = getGameById(gameId) as InternalGame;
                    if (game.isGameReadyToStart()) {
                        game.setTurn(indexPlayer);

                        const playersIds: PlayerId[] = game.getPlayersIds();
                        playersIds.forEach((playerId) => {
                            startGameHandler(game, playerId, (playerId: PlayerId): WebSocket => {
                                return getConnection(playerId) as WebSocket;
                            });
                        });

                        const playerConnection = getConnection(indexPlayer) as WebSocket;
                        sendChangeTurn(playerConnection, { currentPlayer: indexPlayer });
                    }
                    break;
                case "attack":
                    attackHandler(<AttackPayload>parsedData, (playerId: PlayerId): WebSocket => {
                        return getConnection(playerId) as WebSocket;
                    });
                    break;
            }
        });
    });

    return wss;
}

function sendChangeTurn(ws: WebSocket, payload: TurnPayload): void {
    sendMessage(ws, "turn", payload);
}

export { createWenSocketServer };
