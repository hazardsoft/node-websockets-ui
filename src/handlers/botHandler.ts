import { JoinRoomPayload, AddShipsPayload, Ship, ShipTypes, MessageHandler } from "../types.js";
import { joinRoomHandler } from "./joinRoom.js";
import { addPlayer, createRoom, getGameByRoom } from "../state.js";
import { addShipsHandler } from "./addShips.js";
import { ShipsGenerator } from "../model/ShipsGenerator.js";
import { BotPlayer } from "../model/BotPlayer.js";
import { sendRoomsUpdateHandler } from "./updateRooms.js";

const botHandler: MessageHandler = (context): void => {
    const room = createRoom();
    joinRoomHandler(context, <JoinRoomPayload>{
        indexRoom: room.id,
    });
    const bot = new BotPlayer();
    addPlayer(bot);
    room.addPlayer(bot.id);
    sendRoomsUpdateHandler(context.server, "all");

    const ships = new ShipsGenerator().generateShips();
    const externalShips: Ship[] = [];
    ships.forEach((ship) => {
        const positions = ship.getPositions();
        const start = positions[0];

        externalShips.push({
            position: { x: start?.x, y: start?.y },
            direction: ship.direction,
            length: positions.length,
            type: ShipTypes[positions.length],
        });
    });

    const game = getGameByRoom(room)!;
    addShipsHandler({ server: context.server, currentPlayerId: bot.id }, <AddShipsPayload>{
        gameId: game.id,
        indexPlayer: bot.id,
        ships: externalShips,
    });
};
export { botHandler };
