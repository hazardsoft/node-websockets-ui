import { AttackPayload, AttackResponsePayload, PlayerId } from "../types.js";
import { getGameById } from "../state.js";
import { GameServer } from "../server.js";
import { changeTurnHandler } from "./changePlayer.js";

function attackHandler(server: GameServer, payload: AttackPayload) {
    const game = getGameById(payload.gameId);
    if (game && payload.indexPlayer === game.getTurn()) {
        const attackerId = payload.indexPlayer;
        const opponentId = game.getOpponentId(attackerId) as PlayerId;

        const attackResult = game.attackPlayer(opponentId, payload.x, payload.y);
        const playersIds: PlayerId[] = game.getPlayersIds();
        playersIds.forEach((playerId) => {
            sendAttackResult(server, playerId, <AttackResponsePayload>{
                position: { x: payload.x, y: payload.y },
                currentPlayer: attackerId,
                status: attackResult,
            });
        });

        if (attackResult === "miss") {
            changeTurnHandler(server, game, opponentId);
        } else {
            changeTurnHandler(server, game, attackerId);
        }
    }
}

function sendAttackResult(
    server: GameServer,
    playerId: PlayerId,
    payload: AttackResponsePayload
): void {
    server.sendMessageToPlayer(playerId, "attack", payload);
}

export { attackHandler };
