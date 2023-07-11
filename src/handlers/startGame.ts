import { Game } from "../model/Game.js";
import { MessageType, Ship, StartGamePayload } from "../types.js";
import { GameServer } from "../server.js";

const commandName: MessageType = "start_game";

function startGameHandler(server: GameServer, game: Game) {
    game.getPlayersIds().forEach((playerId) => {
        const ships: Ship[] = game.getShipsByPlayerId(playerId)!;

        server.sendMessageToPlayer(playerId, commandName, <StartGamePayload>{
            currentPlayerIndex: playerId,
            ships,
        });
    });
}

export { startGameHandler };
