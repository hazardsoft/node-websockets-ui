import { GameServer } from "./server.js";
import { WebSocket } from "ws";

type PlayerId = number;
type RoomId = number;
type GameId = number;
type Win = number;

type MessageType =
    | "reg"
    | "create_room"
    | "update_room"
    | "add_user_to_room"
    | "create_game"
    | "add_ships"
    | "start_game"
    | "turn"
    | "attack"
    | "finish"
    | "randomAttack"
    | "update_winners"
    | "single_play";

type Message = {
    type: MessageType;
    data: string;
    id: number;
};

type MessageInboundPayload =
    | LoginPayload
    | AttackPayload
    | AddShipsPayload
    | JoinRoomPayload
    | RandomAttackPayload;
type MessageOutboundPayload =
    | LoginResponsePayload
    | CreateGamePayload
    | AttackResponsePayload
    | TurnPayload
    | WinnerPayload
    | StartGamePayload
    | UpdateRoomsPayload
    | FinishGamePayload;

type HandlerContext = {
    server: GameServer;
    connection?: WebSocket;
    currentPlayerId?: PlayerId;
};
type MessageHandler = (context: HandlerContext, payload: MessageInboundPayload) => void;

type NotificationType = "all" | "self" | "others";

type LoginPayload = {
    name: string;
    password: string;
};

type LoginResponsePayload = {
    name: string;
    index: PlayerId;
    error: boolean;
    errorText: string;
};

type JoinRoomPayload = {
    indexRoom: GameId;
};

type CreateGamePayload = {
    idGame: GameId;
    idPlayer: PlayerId;
};

type ShipType = "small" | "medium" | "large" | "huge";
type Ship = {
    position: { x: number; y: number };
    direction: boolean;
    length: number;
    type: ShipType;
};

type RoomUser = {
    name: string;
    index: PlayerId;
};
type Room = {
    roomId: RoomId;
    roomUsers: RoomUser[];
};
type UpdateRoomsPayload = Room[];

type AddShipsPayload = {
    gameId: GameId;
    indexPlayer: PlayerId;
    ships: Ship[];
};

type StartGamePayload = {
    currentPlayerIndex: PlayerId;
    ships: Ship[];
};

type TurnPayload = {
    currentPlayer: PlayerId;
};

type AttackPayload = {
    gameId: GameId;
    x: number;
    y: number;
    indexPlayer: PlayerId;
};

type AttackResponsePayload = {
    position: { x: number; y: number };
    currentPlayer: PlayerId;
    status: AttackResultType;
};

type AttackResult = {
    x: number;
    y: number;
    type: AttackResultType;
};
type AttackResultType = "miss" | "killed" | "shot" | "none";

type FinishGamePayload = {
    winPlayer: PlayerId;
};

type RandomAttackPayload = {
    gameId: GameId;
    indexPlayer: PlayerId;
};

type Winner = {
    name: string;
    wins: Win;
};

type WinnerPayload = Winner[];

type Position = { x: number; y: number };

const ShipTypes: Record<number, ShipType> = {
    1: "small",
    2: "medium",
    3: "large",
    4: "huge",
};

export {
    PlayerId,
    RoomId,
    GameId,
    Ship,
    ShipType,
    LoginPayload,
    LoginResponsePayload,
    Message,
    MessageType,
    JoinRoomPayload,
    CreateGamePayload,
    NotificationType,
    UpdateRoomsPayload,
    Room,
    RoomUser,
    StartGamePayload,
    AddShipsPayload,
    TurnPayload,
    AttackPayload,
    AttackResultType,
    AttackResponsePayload,
    FinishGamePayload,
    RandomAttackPayload,
    Position,
    AttackResult,
    Winner,
    WinnerPayload,
    ShipTypes,
    MessageHandler,
    Win,
    MessageInboundPayload,
    MessageOutboundPayload,
    HandlerContext,
};
