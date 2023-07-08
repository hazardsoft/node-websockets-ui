import {
    AttackPayload,
    AttackResponsePayload,
    AttackResult,
    MessageType,
    PlayerId,
    Position,
} from "../types.js";
import { getGameById } from "../state.js";
import { GameServer } from "../server.js";
import { Game } from "../Game.js";
import { changeTurnHandler } from "./changeTurn.js";
import { finishGameHandler } from "./finishGame.js";

const commandName: MessageType = "attack";

function attackHandler(server: GameServer, payload: AttackPayload) {
    const game = getGameById(payload.gameId);
    if (game && payload.indexPlayer === game.getTurn()) {
        const attackerId = payload.indexPlayer;
        const opponentId = game.getOpponentId(attackerId) as PlayerId;

        const attackResult = game.attackPlayer(opponentId, payload.x, payload.y);
        if (attackResult && attackResult.type !== "none") {
            handleAttackResults(server, game, attackerId, opponentId, attackResult);
        } else {
            // player tries to attack field with already known result
        }
    }
}

function handleAttackResults(
    server: GameServer,
    game: Game,
    attackerId: PlayerId,
    opponentId: PlayerId,
    attackResult: AttackResult
): void {
    const attackResultsToNotifyAbout: AttackResult[] = [attackResult];

    if (attackResult.type === "killed") {
        const positionsAroundDestroyedShip: Position[] = game.getPositionsAroundShip(
            opponentId,
            attackResult.x,
            attackResult.y
        );
        attackResultsToNotifyAbout.push(
            ...positionsAroundDestroyedShip.map((position) => {
                return <AttackResult>{ x: position.x, y: position.y, type: "miss" };
            })
        );
    }

    // send all attack results (including revealed cells around destroyed ship) to attacker
    attackResultsToNotifyAbout.forEach((attackResult) => {
        game.setAttackResultOnOpponentField(attackerId, attackResult);

        server.sendMessageToPlayer(attackerId, commandName, <AttackResponsePayload>{
            position: { x: attackResult.x, y: attackResult.y },
            currentPlayer: attackerId,
            status: attackResult.type,
        });
    });

    // send attack result to opponent (no need to send revealed cells around destroyed ship)
    server.sendMessageToPlayer(opponentId, commandName, <AttackResponsePayload>{
        position: { x: attackResult.x, y: attackResult.y },
        currentPlayer: attackerId,
        status: attackResult.type,
    });

    switch (attackResult.type) {
        case "miss":
            changeTurnHandler(server, game, opponentId);
            break;
        case "shot":
            changeTurnHandler(server, game, attackerId);
            break;
        case "killed":
            if (game.isGameFinished()) {
                finishGameHandler(server, game, attackerId);
            } else {
                changeTurnHandler(server, game, attackerId);
            }
            break;
    }
}

export { attackHandler };
