import { GameServer } from "../server.js";
import { getGameById, setShips } from "../state.js";
import { AddShipsPayload, PlayerId } from "../types.js";
import { Game } from "../model/Game.js";
import { startGameHandler } from "./startGame.js";
import { changeTurnHandler } from "./changeTurn.js";

function addShipsHandler(server: GameServer, payload: AddShipsPayload): void {
    const { gameId, indexPlayer, ships } = payload;
    setShips(gameId, indexPlayer, ships);

    const game: Game = getGameById(gameId) as Game;
    if (game.isGameReadyToStart()) {
        const playersIds: PlayerId[] = game.getPlayersIds();

        playersIds.forEach((playerId) => {
            startGameHandler(server, game, playerId);
        });
        changeTurnHandler(server, game, indexPlayer);
    }
}

export { addShipsHandler };
