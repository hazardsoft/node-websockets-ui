import { httpServer } from "./http_server/index.js";
import { GameServer } from "./server.js";

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const gameServer: GameServer = new GameServer(3000);
