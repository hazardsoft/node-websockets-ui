import { GameServer, MessageHandler } from "../server.js";
import { PlayerId, JoinRoomPayload, AddShipsPayload, Ship, ShipTypes } from "../types.js";
import { joinRoomHandler } from "./joinRoom.js";
import { createRoom, getGameByRoom } from "../state.js";
import { addShipsHandler } from "./addShips.js";
import { Game } from "../model/Game.js";
import { ShipsGenerator } from "../model/ShipsGenerator.js";
import { BotPlayer } from "../model/BotPlayer.js";

const botHandler: MessageHandler = (server: GameServer, _, currentPlayerId: PlayerId): void => {
    const room = createRoom();
    joinRoomHandler(server, _, currentPlayerId, <JoinRoomPayload>{
        indexRoom: room.id,
    });
    const bot = new BotPlayer();
    room.addPlayer(bot);

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
    console.table(externalShips);

    const game = getGameByRoom(room)!;
    addShipsHandler(server, _, bot.id, <AddShipsPayload>{
        gameId: game.id,
        indexPlayer: bot.id,
        ships: externalShips,
    });
};
export { botHandler };
