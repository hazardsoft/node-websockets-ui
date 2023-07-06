import { LoginPayload, LoginResponsePayload } from "../types.js";
import { Player } from "../Player.js";
import { sendMessage, sendRoomsUpdate } from "../pub.js";
import { addPlayer } from "../state.js";
import { WebSocket, WebSocketServer } from "ws";

const errorMessage = "Player exists already";

function loginHandler(
    wss: WebSocketServer,
    ws: WebSocket,
    payload: LoginPayload,
    newPlayerCallback: (playerId: string) => void
) {
    const { name, password } = payload;
    const newPlayer = addPlayer(name, password);
    if (newPlayer) {
        newPlayerCallback(newPlayer.id);
    }
    sendLoginResponse(ws, newPlayer);
    sendRoomsUpdate(wss, ws, "self");
}

function sendLoginResponse(ws: WebSocket, player: Player | undefined): void {
    sendMessage(ws, "reg", <LoginResponsePayload>{
        name: player?.name,
        index: player?.id,
        error: !player,
        errorText: !player ? errorMessage : "",
    });
}

export { loginHandler };
