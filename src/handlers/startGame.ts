import { Game } from "../Game.js";
import { PlayerId, Ship, StartGamePayload } from "../types.js";
import { GameServer } from "../server.js";

function startGameHandler(server: GameServer, game: Game, playerId: PlayerId) {
    const ships: Ship[] = game.getShipsByPlayerId(playerId) as Ship[];
    const payload: StartGamePayload = {
        currentPlayerIndex: playerId,
        ships,
    };

    sendStartGame(server, playerId, payload);
}

function sendStartGame(server: GameServer, playerId: PlayerId, payload: StartGamePayload): void {
    server.sendMessageToPlayer(playerId, "start_game", payload);
}

export { startGameHandler };
