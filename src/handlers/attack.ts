import { AttackPayload, AttackResponsePayload, MessageType, PlayerId } from "../types.js";
import { getGameById } from "../state.js";
import { GameServer } from "../server.js";
import { changeTurnHandler } from "./changeTurn.js";
import { finishGameHandler } from "./finishGame.js";

const commandName: MessageType = "attack";

function attackHandler(server: GameServer, payload: AttackPayload) {
    const game = getGameById(payload.gameId);
    if (game && payload.indexPlayer === game.getTurn()) {
        const attackerId = payload.indexPlayer;
        const opponentId = game.getOpponentId(attackerId) as PlayerId;

        const attackResult = game.attackPlayer(opponentId, payload.x, payload.y);
        if (attackResult && attackResult !== "none") {
            game.setAttackResultOnOpponentField(attackerId, payload.x, payload.y, attackResult);

            const playersIds: PlayerId[] = game.getPlayersIds();
            playersIds.forEach((playerId) => {
                server.sendMessageToPlayer(playerId, commandName, <AttackResponsePayload>{
                    position: { x: payload.x, y: payload.y },
                    currentPlayer: attackerId,
                    status: attackResult,
                });
            });

            switch (attackResult) {
                case "miss":
                    changeTurnHandler(server, game, opponentId);
                    break;
                case "shot":
                    changeTurnHandler(server, game, attackerId);
                    break;
                case "killed":
                    if (game.isGameFinished()) {
                        finishGameHandler(server, game, attackerId);
                    } else {
                        changeTurnHandler(server, game, attackerId);
                    }
                    break;
            }
        }
    }
}

export { attackHandler };
