import { httpServer } from "./http_server/index.js";
import { GameServer } from "./server.js";
import { generateShips } from "./bot/commands/generate.js";
import { Ship, ShipTypes } from "./types.js";

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const gameServer: GameServer = new GameServer(3000);

const ships = generateShips();
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
