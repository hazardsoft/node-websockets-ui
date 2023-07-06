import { WebSocket } from "ws";
import { Game } from "../Game.js";
import { PlayerId, Ship, StartGamePayload } from "../types.js";
import { sendMessage } from "../pub.js";

function startGameHandler(
    game: Game,
    playerId: PlayerId,
    getConnection: (playerId: PlayerId) => WebSocket
) {
    const ships: Ship[] = game.getShipsByPlayerId(playerId) as Ship[];
    const payload: StartGamePayload = {
        currentPlayerIndex: playerId,
        ships,
    };

    const playerConnection = getConnection(playerId);
    sendStartGame(playerConnection, payload);
}

function sendStartGame(ws: WebSocket, payload: StartGamePayload): void {
    sendMessage(ws, "start_game", payload);
}

export { startGameHandler };
