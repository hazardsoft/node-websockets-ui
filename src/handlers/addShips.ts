import { getGameById, setShips } from "../state.js";
import { AddShipsPayload, MessageHandler } from "../types.js";
import { startGameHandler } from "./startGame.js";
import { changeTurnHandler } from "./changeTurn.js";

const addShipsHandler: MessageHandler = (context, payload): void => {
    const { gameId, indexPlayer, ships } = payload as AddShipsPayload;
    setShips(gameId, indexPlayer, ships);

    const game = getGameById(gameId);
    if (game?.isGameReadyToStart()) {
        startGameHandler(context.server, game);
        changeTurnHandler(context.server, game, indexPlayer);
    }
};

export { addShipsHandler };
