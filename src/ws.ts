import { IncomingMessage } from "http";
import { WebSocket, WebSocketServer } from "ws";

type MessageType = "reg";
type ResponsePayload = Record<string, unknown>;

type Message = {
    type: MessageType;
    data: string;
    id: number;
};

type RegPayload = {
    name: string;
    password: string;
};

type RegResponse = {
    name: string;
    index: number;
    error: boolean;
    errorText: string;
};

function createWenSocketServer(port: number): WebSocketServer {
    const wss = new WebSocketServer({ port });

    wss.on("connection", (ws: WebSocket, req: IncomingMessage): void => {
        console.log("wss: connection event");

        ws.on("error", (error: Error) => {
            console.error(error);
        });
        ws.on("close", () => console.log("ws connection closed by client"));

        ws.on("message", (data: Buffer | ArrayBuffer | Buffer[], isBinary: boolean) => {
            const str: string = data.toString();
            const message: Message = JSON.parse(str);
            const parsedData: Record<string, unknown> = JSON.parse(message.data);
            switch (message.type) {
                case "reg":
                    const regMessage: RegPayload = parsedData as RegPayload;
                    sendResponse(
                        ws,
                        message.type,
                        <RegResponse>{
                            name: regMessage.name,
                            index: 0,
                            error: false,
                            errorText: "",
                        },
                        message.id
                    );
                    break;
            }
            message.data = JSON.parse(message.data);
            console.log("received: %s", data);
            console.log("message", message);
        });
    });

    return wss;
}

function sendResponse(ws: WebSocket, type: MessageType, data: ResponsePayload, id: number): void {
    const message: Message = {
        type,
        data: JSON.stringify(data),
        id,
    };
    ws.send(JSON.stringify(message));
}

export { createWenSocketServer };
