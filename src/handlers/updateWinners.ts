import { GameServer } from "../server.js";
import { getPlayerById, getWins } from "../state.js";
import { MessageType, NotificationType, PlayerId, Winner, WinnerPayload } from "../types.js";

const commandName: MessageType = "update_winners";

function sendWinnersUpdateHandler(
    server: GameServer,
    notificationType: NotificationType,
    playerId?: PlayerId
): void {
    const payload: WinnerPayload = [];
    const wins = getWins();
    for (const playerId in wins) {
        const player = getPlayerById(playerId);
        if (player) {
            payload.push(<Winner>{ name: player.name, wins: wins[playerId] });
        }
    }

    server.sendNotification(commandName, payload, notificationType, playerId);
}

export { sendWinnersUpdateHandler };
