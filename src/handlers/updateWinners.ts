import { GameServer } from "../server.js";
import { getPlayerById, getWins } from "../state.js";
import { MessageType, NotificationType, PlayerId, Winner, WinnerPayload, Win } from "../types.js";

const commandName: MessageType = "update_winners";

function sendWinnersUpdateHandler(
    server: GameServer,
    notificationType: NotificationType,
    playerId?: PlayerId
): void {
    const payload: WinnerPayload = [];
    getWins().forEach((wins: Win, playerId: PlayerId) => {
        const player = getPlayerById(playerId);
        if (player) {
            payload.push(<Winner>{ name: player.name, wins });
        }
    });

    server.sendNotification(commandName, payload, notificationType, playerId);
}

export { sendWinnersUpdateHandler };
