import { WebSocket } from "ws";
import { AttackPayload, AttackResponsePayload, PlayerId } from "../types.js";
import { sendMessage } from "../pub.js";
import { getGameById } from "../state.js";

function attackHandler(payload: AttackPayload, getConnection: (playerId: PlayerId) => WebSocket) {
    const game = getGameById(payload.gameId);
    if (game && payload.indexPlayer === game.getTurn()) {
        const attackerId = payload.indexPlayer;
        const opponentId = game.getOpponentId(attackerId) as PlayerId;

        const attackResult = game.attackPlayer(opponentId, payload.x, payload.y);
        const playersIds: PlayerId[] = game.getPlayersIds();
        playersIds.forEach((playerId) => {
            const playerConnection = getConnection(playerId);
            sendAttackResult(playerConnection, <AttackResponsePayload>{
                position: { x: payload.x, y: payload.y },
                currentPlayer: attackerId,
                status: attackResult,
            });
        });
    }
}

function sendAttackResult(ws: WebSocket, payload: AttackResponsePayload): void {
    sendMessage(ws, "attack", payload);
}

export { attackHandler };
