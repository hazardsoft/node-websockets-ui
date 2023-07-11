import { GameServer, MessageHandler } from "../server.js";
import { getGameById, setShips } from "../state.js";
import { AddShipsPayload } from "../types.js";
import { startGameHandler } from "./startGame.js";
import { changeTurnHandler } from "./changeTurn.js";

const addShipsHandler: MessageHandler = (
    server: GameServer,
    _,
    __,
    payload: AddShipsPayload
): void => {
    const { gameId, indexPlayer, ships } = payload;
    setShips(gameId, indexPlayer, ships);

    const game = getGameById(gameId);
    if (game?.isGameReadyToStart()) {
        startGameHandler(server, game);
        changeTurnHandler(server, game, indexPlayer);
    }
};

export { addShipsHandler };
