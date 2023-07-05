import { WebSocketServer } from "ws";
import { httpServer } from "./http_server/index.js";
import { createWenSocketServer } from "./ws.js";

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wss: WebSocketServer = createWenSocketServer(3000);
