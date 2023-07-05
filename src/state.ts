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

function addPlayer(player: Player): boolean {
    const existingUser: Player | undefined = users.find(
        (user) => user.name === player.name && user.password === player.password
    );
    if (existingUser) {
        return false;
    }
    player.id = randomUUID();
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

export { addPlayer, createRoom, getRooms, Player as InternalPlayer, Room as InternalRoom };
