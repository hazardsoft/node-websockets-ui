import { Game } from "../model/Game.js";
import { GameServer } from "../server.js";
import { MessageType, PlayerId, TurnPayload } from "../types.js";

const commandName: MessageType = "turn";

function changeTurnHandler(server: GameServer, game: Game, playerId: PlayerId) {
    game.setTurn(playerId);
    server.sendMessageToPlayer(playerId, commandName, <TurnPayload>{ currentPlayer: playerId });
}

export { changeTurnHandler };
