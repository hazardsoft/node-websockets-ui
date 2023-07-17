import { getGameById } from "../state.js";
import { AttackPayload, Position, RandomAttackPayload, MessageHandler } from "../types.js";
import { attackHandler } from "./attack.js";

const randomAttackHandler: MessageHandler = (context, payload): void => {
    const { gameId, indexPlayer } = payload as RandomAttackPayload;
    const game = getGameById(gameId);
    if (game && indexPlayer === game.getTurn()) {
        const attackerId = indexPlayer;

        const randomPositionToAttack: Position = game.getRandomPositionToAttack(attackerId);
        attackHandler(context, <AttackPayload>{
            gameId: gameId,
            indexPlayer: indexPlayer,
            x: randomPositionToAttack.x,
            y: randomPositionToAttack.y,
        });
    }
};
export { randomAttackHandler };
