import { Game } from "../Game.js";
import { GameServer } from "../server.js";
import { PlayerId, FinishGamePayload, MessageType } from "../types.js";
import { emptyRoom } from "../state.js";
import { sendRoomsUpdateHandler } from "./updateRooms.js";

const commandName: MessageType = "finish";

function finishGameHandler(server: GameServer, game: Game, winnerId: PlayerId): void {
    const playersIds: PlayerId[] = game.getPlayersIds();
    playersIds.forEach((playerId) => {
        server.sendMessageToPlayer(playerId, commandName, <FinishGamePayload>{
            winPlayer: winnerId,
        });
    });
    emptyRoom(game);
    sendRoomsUpdateHandler(server, "all");
}

export { finishGameHandler };
