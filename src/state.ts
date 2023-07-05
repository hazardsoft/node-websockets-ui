import { randomUUID } from "node:crypto";
import { RegPayload, Ship } from "./ws.js";

type Player = {
    id: string;
    name: string;
    password: string;
};

type Room = {
    id: string;
    players: Player[];
    game?: Game;
};

type Game = {
    id: string;
    playersShips: Map<Player, Ship[]>;
};

type GameId = string;
type PlayerId = string;

const users: Player[] = [];
const rooms: Room[] = [];
const games: Game[] = [];

function addPlayer(player: RegPayload): Player | undefined {
    const existingUser: Player | undefined = users.find(
        (user) => user.name === player.name && user.password === player.password
    );
    if (existingUser) {
        return undefined;
    }
    const user: Player = { id: randomUUID(), name: player.name, password: player.password };
    users.push(user);
    return user;
}

function createRoom(): void {
    const room: Room = { id: randomUUID(), players: [] };
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

function createGameInRoom(room: Room): Game {
    const game: Game = {
        id: randomUUID(),
        playersShips: new Map(),
    };
    room.game = game;
    games.push(game);
    return game;
}

function clearGameInRoom(room: Room): void {
    const game: Game | undefined = room.game;
    if (game) {
        const index = games.findIndex((v) => v === game);
        games.splice(index, 1);
        room.game = undefined;
    }
}

function getGameById(id: string): Game | undefined {
    return games.find((game) => game.id === id);
}

function setShips(gameId: string, playerId: string, ships: Ship[]): void {
    const game: Game | undefined = getGameById(gameId);
    const player: Player | undefined = getPlayerById(playerId);
    if (game && player) {
        game.playersShips.set(player, ships);
    }
}

function getShips(gameId: string, playerId: string): Ship[] | undefined {
    const game: Game | undefined = getGameById(gameId);
    const player: Player | undefined = getPlayerById(playerId);
    if (game && player) {
        return game.playersShips.get(player);
    }
    return undefined;
}

function isGameReadyToStart(game: Game): boolean {
    return game.playersShips.size === 2;
}

export {
    addPlayer,
    createRoom,
    getRooms,
    joinRoom,
    createGameInRoom,
    clearGameInRoom,
    getRoomById,
    getPlayerById,
    getGameById,
    isGameReadyToStart,
    setShips,
    Player as InternalPlayer,
    Room as InternalRoom,
    Game as InternalGame,
};
