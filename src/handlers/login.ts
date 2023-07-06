import { WebSocket } from "ws";
import { LoginPayload, LoginResponsePayload, PlayerId } from "../types.js";
import { Player } from "../Player.js";
import { sendRoomsUpdate } from "../pub.js";
import { addPlayer } from "../state.js";
import { GameServer } from "../server.js";

const errorMessage = "Player exists already";

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
    sendLoginResponse(server, connection, player);
    sendRoomsUpdate(server, "self", player?.id);
}

function sendLoginResponse(
    server: GameServer,
    connection: WebSocket,
    player: Player | undefined
): void {
    server.sendMessage(connection, "reg", <LoginResponsePayload>{
        name: player?.name,
        index: player?.id,
        error: !player,
        errorText: !player ? errorMessage : "",
    });
}

export { loginHandler };
