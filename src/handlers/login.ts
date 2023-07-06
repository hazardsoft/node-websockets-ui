import { WebSocket } from "ws";
import { LoginPayload, LoginResponsePayload, MessageType, PlayerId } from "../types.js";
import { sendRoomsUpdateHandler } from "./updateRooms.js";
import { addPlayer } from "../state.js";
import { GameServer } from "../server.js";

const errorMessage = "Player exists already";
const commandName: MessageType = "reg";

function loginHandler(
    server: GameServer,
    connection: WebSocket,
    payload: LoginPayload,
    registerPlayer: (playerId: PlayerId) => void
) {
    const { name, password } = payload;
    const player = addPlayer(name, password);
    if (player) {
        registerPlayer(player.id);
    }
    server.sendMessage(connection, commandName, <LoginResponsePayload>{
        name: player?.name,
        index: player?.id,
        error: !player,
        errorText: !player ? errorMessage : "",
    });
    sendRoomsUpdateHandler(server, "self", player?.id);
}

export { loginHandler };
