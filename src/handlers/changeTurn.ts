import { Game } from "../model/Game.js";
import { GameServer } from "../server.js";
import { getPlayerById } from "../state.js";
import { MessageType, PlayerId, RandomAttackPayload, TurnPayload } from "../types.js";
import { randomAttackHandler } from "./randomAttack.js";
import { BotPlayer } from "../model/BotPlayer.js";
import { botTurnTimeout } from "../config.js";

const commandName: MessageType = "turn";

const changeTurnHandler = (server: GameServer, game: Game, playerId: PlayerId) => {
    game.setTurn(playerId);
    const player = getPlayerById(playerId);
    if (player instanceof BotPlayer) {
        const opponentId: PlayerId = game.getOpponentId(playerId)!;
        server.sendMessageToPlayer(opponentId, commandName, <TurnPayload>{
            currentPlayer: playerId,
        });
        setTimeout(() => {
            randomAttackHandler({ server, currentPlayerId: opponentId }, <RandomAttackPayload>{
                gameId: game.id,
                indexPlayer: playerId,
            });
        }, botTurnTimeout);
    } else {
        game.getPlayersIds().forEach((id: PlayerId) => {
            server.sendMessageToPlayer(id, commandName, <TurnPayload>{ currentPlayer: playerId });
        });
    }
};

export { changeTurnHandler };
