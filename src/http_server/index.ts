import { readFile } from "node:fs";
import { resolve, dirname } from "node:path";
import { IncomingMessage, ServerResponse, createServer } from "node:http";

export const httpServer = createServer((req: IncomingMessage, res: ServerResponse) => {
    const __dirname = resolve(dirname(''));
    const file_path = __dirname + (req.url === '/' ? '/front/index.html' : '/front' + req.url);
    readFile(file_path, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        }
        res.writeHead(200);
        res.end(data);
    });
});
