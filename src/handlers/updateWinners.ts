import { Player } from "../model/Player.js";
import { GameServer } from "../server.js";
import { getPlayers } from "../state.js";
import { MessageType, NotificationType, PlayerId, Winner, WinnerPayload } from "../types.js";

const commandName: MessageType = "update_winners";

function sendWinnersUpdateHandler(
    server: GameServer,
    notificationType: NotificationType,
    playerId?: PlayerId
): void {
    const players: Player[] = getPlayers().filter((player) => player.wins > 0);
    const payload: WinnerPayload = players.map(({ name, wins }) => {
        return <Winner>{ name, wins };
    });
    server.sendNotification(commandName, payload, notificationType, playerId);
}

export { sendWinnersUpdateHandler };
