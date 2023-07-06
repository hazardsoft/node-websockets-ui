import { Game } from "../Game.js";
import { GameServer } from "../server.js";
import { PlayerId, FinishGamePayload } from "../types.js";
import { emptyRoom } from "../state.js";
import { sendRoomsUpdate } from "../pub.js";

function finishGameHandler(server: GameServer, game: Game, winnerId: PlayerId): void {
    const playersIds: PlayerId[] = game.getPlayersIds();
    playersIds.forEach((playerId) => {
        server.sendMessageToPlayer(playerId, "finish", <FinishGamePayload>{ winPlayer: winnerId });
    });
    emptyRoom(game);
    sendRoomsUpdate(server, "all");
}

export { finishGameHandler };
