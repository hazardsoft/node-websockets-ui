import { WebSocket } from "ws";
import { LoginPayload, LoginResponsePayload, MessageType, PlayerId } from "../types.js";
import { sendRoomsUpdateHandler } from "./updateRooms.js";
import { sendWinnersUpdateHandler } from "./updateWinners.js";
import { registerPlayer, authPlayer, addActivePlayer } from "../state.js";
import { GameServer, MessageHandler } from "../server.js";
import { Player } from "../model/Player.js";
import { AlreadyAuthenticated, IncorrectCredentials, UserNotFound } from "../errors.js";

const commandName: MessageType = "reg";

const loginHandler: MessageHandler = (
    server: GameServer,
    connection: WebSocket,
    _,
    payload: LoginPayload
): void => {
    const { name, password } = payload;
    let player: Player | undefined;
    try {
        player = authPlayer(name, password);
    } catch (error) {
        if (error instanceof AlreadyAuthenticated) {
            sendError(server, connection, name, error.message);
        }
        if (error instanceof IncorrectCredentials) {
            sendError(server, connection, name, error.message);
        }
        if (error instanceof UserNotFound) {
            player = registerPlayer(name, password);
        }
    }

    if (player) {
        addActivePlayer(player);
        server.setConnectionByPlayerId(player.id, connection);
        server.sendMessage(connection, commandName, <LoginResponsePayload>{
            name: player.name,
            index: player.id,
            error: false,
            errorText: "",
        });

        sendRoomsUpdateHandler(server, "self", player.id);
        sendWinnersUpdateHandler(server, "self", player.id);
    }
};

function sendError(
    server: GameServer,
    connection: WebSocket,
    name: string,
    errorMessage: string
): void {
    server.sendMessage(connection, commandName, <LoginResponsePayload>{
        name: name,
        index: "",
        error: true,
        errorText: errorMessage,
    });
}

export { loginHandler };
