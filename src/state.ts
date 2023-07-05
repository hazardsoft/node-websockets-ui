import { randomUUID } from "node:crypto";

type Player = {
    id: string;
    name: string;
    password: string;
};

type Room = {
    id: string;
    isPlaying: boolean;
    players: Player[];
};

const users: Player[] = [];
const rooms: Room[] = [];
let currentPlayer: Player;

function addPlayer(player: Player): boolean {
    const existingUser: Player | undefined = users.find(
        (user) => user.name === player.name && user.password === player.password
    );
    if (existingUser) {
        return false;
    }
    player.id = randomUUID();
    currentPlayer = player;
    users.push(player);
    return true;
}

function createRoom(): void {
    const room: Room = { id: randomUUID(), isPlaying: false, players: [] };
    rooms.push(room);
}

function getRooms(): Room[] {
    return rooms.slice();
}

function getCurrentPlayer(): Player {
    return currentPlayer;
}

function joinRoom(roomId: string): boolean {
    const room: Room | undefined = rooms.find((room) => room.id === roomId);
    if (!room) return false;
    room.players.push(currentPlayer);
    return true;
}

export {
    addPlayer,
    createRoom,
    getRooms,
    getCurrentPlayer,
    joinRoom,
    Player as InternalPlayer,
    Room as InternalRoom,
};
