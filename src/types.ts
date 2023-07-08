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
    | "randomAttack";

type Message = {
    type: MessageType;
    data: string;
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

type Ship = {
    position: { x: number; y: number };
    direction: boolean;
    length: number;
    type: "small" | "medium" | "large" | "huge";
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

type Position = { x: number; y: number };

export {
    PlayerId,
    RoomId,
    GameId,
    Ship,
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
};
