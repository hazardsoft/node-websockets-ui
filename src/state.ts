import { randomUUID } from "node:crypto";
import { RegPayload } from "./ws.js";

type Player = {
    id: string;
    name: string;
    password: string;
};

type Room = {
    id: string;
    players: Player[];
    games: Map<Player, PlayerGame>;
};

type PlayerGame = {
    id: string;
};

const users: Player[] = [];
const rooms: Room[] = [];

function addPlayer(player: RegPayload): Player | null {
    const existingUser: Player | undefined = users.find(
        (user) => user.name === player.name && user.password === player.password
    );
    if (existingUser) {
        return null;
    }
    const user: Player = { id: randomUUID(), name: player.name, password: player.password };
    users.push(user);
    return user;
}

function createRoom(): void {
    const room: Room = { id: randomUUID(), players: [], games: new Map() };
    rooms.push(room);
}

function getRooms(): Room[] {
    return rooms.slice();
}

function getPlayerById(id: string): Player | undefined {
    return users.find((user) => user.id === id);
}

function joinRoom(roomId: string, player: Player): boolean {
    const room: Room | undefined = rooms.find((room) => room.id === roomId);
    if (!room) return false;
    room.players.push(player);
    return true;
}

function getRoomById(roomId: string): Room | undefined {
    return rooms.find((room) => room.id === roomId);
}

function createGameInRoomForPlayer(room: Room, player: Player): string {
    const game: PlayerGame = {
        id: randomUUID(),
    };
    room.games.set(player, game);
    return game.id;
}

export {
    addPlayer,
    createRoom,
    getRooms,
    joinRoom,
    createGameInRoomForPlayer,
    getRoomById,
    getPlayerById,
    Player as InternalPlayer,
    Room as InternalRoom,
};
