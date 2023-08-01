import { GameServer } from "../server.js";
import { PlayerId } from "../types.js";
import { getGameByPlayerId } from "../state.js";
import { finishGameHandler } from "./finishGame.js";

function forceFinishGameHandler(server: GameServer, lostPlayerId: PlayerId): void {
    const game = getGameByPlayerId(lostPlayerId);
    if (game) {
        const winnerId = game.getOpponentId(lostPlayerId);
        if (winnerId) finishGameHandler(server, game, winnerId);
    }
}

export { forceFinishGameHandler };
