import { Game } from "../Game.js";
import { GameServer } from "../server.js";
import { PlayerId, TurnPayload } from "../types.js";

function changeTurnHandler(server: GameServer, game: Game, playerId: PlayerId) {
    game.setTurn(playerId);
    server.sendMessageToPlayer(playerId, "turn", <TurnPayload>{ currentPlayer: playerId });
}

export { changeTurnHandler };
