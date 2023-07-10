import { Game } from "../model/Game.js";
import { GameServer } from "../server.js";
import { PlayerId, FinishGamePayload, MessageType } from "../types.js";
import { removeGame, assignWinToPlayer, removeRoomByGame } from "../state.js";
import { sendRoomsUpdateHandler } from "./updateRooms.js";
import { sendWinnersUpdateHandler } from "./updateWinners.js";

const commandName: MessageType = "finish";

function finishGameHandler(server: GameServer, game: Game, winnerId: PlayerId): void {
    const playersIds: PlayerId[] = game.getPlayersIds();
    playersIds.forEach((playerId) => {
        server.sendMessageToPlayer(playerId, commandName, <FinishGamePayload>{
            winPlayer: winnerId,
        });
    });
    assignWinToPlayer(winnerId);
    removeGame(game);
    removeRoomByGame(game);
    sendRoomsUpdateHandler(server, "all");
    sendWinnersUpdateHandler(server, "all");
}

export { finishGameHandler };
