import { GameServer } from "../server.js";
import { getGameById } from "../state.js";
import { AttackPayload, PlayerId, Position, RandomAttackPayload } from "../types.js";
import { attackHandler } from "./attack.js";

function randomAttackHandler(server: GameServer, payload: RandomAttackPayload): void {
    const game = getGameById(payload.gameId);
    if (game && payload.indexPlayer === game.getTurn()) {
        const attackerId = payload.indexPlayer;

        const randomPositionToAttack: Position = game.getRandomPositionToAttack(attackerId);
        attackHandler(server, <AttackPayload>{
            gameId: payload.gameId,
            indexPlayer: payload.indexPlayer,
            x: randomPositionToAttack.x,
            y: randomPositionToAttack.y,
        });
    }
}
export { randomAttackHandler };
