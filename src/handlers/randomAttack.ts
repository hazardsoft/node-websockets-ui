import { GameServer, MessageHandler } from "../server.js";
import { getGameById } from "../state.js";
import { AttackPayload, Position, RandomAttackPayload } from "../types.js";
import { attackHandler } from "./attack.js";

const randomAttackHandler: MessageHandler = (
    server: GameServer,
    _,
    __,
    payload: RandomAttackPayload
): void => {
    const game = getGameById(payload.gameId);
    if (game && payload.indexPlayer === game.getTurn()) {
        const attackerId = payload.indexPlayer;

        const randomPositionToAttack: Position = game.getRandomPositionToAttack(attackerId);
        attackHandler(server, _, __, <AttackPayload>{
            gameId: payload.gameId,
            indexPlayer: payload.indexPlayer,
            x: randomPositionToAttack.x,
            y: randomPositionToAttack.y,
        });
    }
};
export { randomAttackHandler };
