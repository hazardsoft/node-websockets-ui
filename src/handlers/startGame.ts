import { Game } from "../model/Game.js";
import { MessageType, PlayerId, Ship, StartGamePayload } from "../types.js";
import { GameServer } from "../server.js";

const commandName: MessageType = "start_game";

function startGameHandler(server: GameServer, game: Game, playerId: PlayerId) {
    const ships: Ship[] = game.getShipsByPlayerId(playerId) as Ship[];

    server.sendMessageToPlayer(playerId, commandName, <StartGamePayload>{
        currentPlayerIndex: playerId,
        ships,
    });
}

export { startGameHandler };
