type PlayerId = string;
type RoomId = string;
type GameId = string;

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
    | "update_winners";

type Message = {
    type: MessageType;
    data: string;
    id: number;
};

type NotificationType = "all" | "self" | "others";

type LoginPayload = {
    name: string;
    password: string;
};

type LoginResponsePayload = {
    name: string;
    index: string;
    error: boolean;
    errorText: string;
};

type JoinRoomPayload = {
    indexRoom: string;
};

type CreateGamePayload = {
    idGame: string;
    idPlayer: string;
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
    index: string;
};
type Room = {
    roomId: string;
    roomUsers: RoomUser[];
};
type UpdateRoomsPayload = Room[];

type AddShipsPayload = {
    gameId: string;
    indexPlayer: string;
    ships: Ship[];
};

type StartGamePayload = {
    currentPlayerIndex: string;
    ships: Ship[];
};

type TurnPayload = {
    currentPlayer: string;
};

type AttackPayload = {
    gameId: string;
    x: number;
    y: number;
    indexPlayer: string;
};

type AttackResponsePayload = {
    position: { x: number; y: number };
    currentPlayer: string;
    status: AttackResultType;
};

type AttackResult = {
    x: number;
    y: number;
    type: AttackResultType;
};
type AttackResultType = "miss" | "killed" | "shot" | "none";

type FinishGamePayload = {
    winPlayer: string;
};

type RandomAttackPayload = {
    gameId: string;
    indexPlayer: string;
};

type Winner = {
    name: string;
    wins: number;
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
};
