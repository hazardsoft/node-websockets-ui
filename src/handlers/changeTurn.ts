import { WebSocket } from "ws";
import { Game } from "../model/Game.js";
import { GameServer } from "../server.js";
import { Room } from "../model/Room.js";
import { getRoomByGame } from "../state.js";
import { MessageType, PlayerId, RandomAttackPayload, TurnPayload } from "../types.js";
import { randomAttackHandler } from "./randomAttack.js";
import { BotPlayer } from "../model/BotPlayer.js";

const commandName: MessageType = "turn";
const botTurnTimeout = 500;

const changeTurnHandler = (server: GameServer, game: Game, playerId: PlayerId) => {
    game.setTurn(playerId);
    const room: Room = getRoomByGame(game)!;
    const player = room.getPlayers().find((player) => player.id === playerId);
    if (player instanceof BotPlayer) {
        const opponentId: PlayerId = game.getOpponentId(playerId)!;
        setTimeout(() => {
            const connection = null as unknown as WebSocket;
            randomAttackHandler(server, connection, opponentId, <RandomAttackPayload>{
                gameId: game.id,
                indexPlayer: playerId,
            });
        }, botTurnTimeout);
    } else {
        game.getPlayersIds().forEach((id: PlayerId) => {
            server.sendMessageToPlayer(id, commandName, <TurnPayload>{ currentPlayer: playerId });
        });
    }
};

export { changeTurnHandler };
