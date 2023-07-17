import {
    LoginPayload,
    LoginResponsePayload,
    MessageHandler,
    MessageType,
    HandlerContext,
} from "../types.js";
import { sendRoomsUpdateHandler } from "./updateRooms.js";
import { sendWinnersUpdateHandler } from "./updateWinners.js";
import { registerPlayer, authPlayer, addActivePlayer } from "../state.js";
import { Player } from "../model/Player.js";
import { AlreadyAuthenticated, IncorrectCredentials, UserNotFound } from "../errors.js";

const commandName: MessageType = "reg";

const loginHandler: MessageHandler = (context, payload): void => {
    const { name, password } = payload as LoginPayload;
    let player: Player | undefined;
    try {
        player = authPlayer(name, password);
    } catch (error) {
        if (error instanceof AlreadyAuthenticated) {
            sendError(context, name, error.message);
        }
        if (error instanceof IncorrectCredentials) {
            sendError(context, name, error.message);
        }
        if (error instanceof UserNotFound) {
            player = registerPlayer(name, password);
        }
    }

    if (player) {
        addActivePlayer(player);
        context.server.setConnectionByPlayerId(player.id, context.connection!);
        context.server.sendMessage(context.connection!, commandName, <LoginResponsePayload>{
            name: player.name,
            index: player.id,
            error: false,
            errorText: "",
        });

        sendRoomsUpdateHandler(context.server, "self", player.id);
        sendWinnersUpdateHandler(context.server, "self", player.id);
    }
};

function sendError(context: HandlerContext, name: string, errorMessage: string): void {
    context.server.sendMessage(context.connection!, commandName, <LoginResponsePayload>{
        name: name,
        index: 0,
        error: true,
        errorText: errorMessage,
    });
}

export { loginHandler };
