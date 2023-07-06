import { randomUUID } from "node:crypto";
import { Ship } from "./types.js";
import { Player } from "./Player.js";
import { Game } from "./Game.js";
import { Room } from "./Room.js";

const users: Player[] = [];
const rooms: Room[] = [];
const games: Game[] = [];

function addPlayer(name: string, password: string): Player | undefined {
    const existingUser: Player | undefined = users.find(
        (user) => user.name === name && user.password === password
    );
    if (existingUser) {
        return undefined;
    }
    const user: Player = new Player(randomUUID(), name, password);
    users.push(user);
    return user;
}

function createRoom(): void {
    const room: Room = new Room(randomUUID());
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
    room.addPlayer(player);
    return true;
}

function getRoomById(roomId: string): Room | undefined {
    return rooms.find((room) => room.id === roomId);
}

function createGameInRoom(room: Room): Game {
    const game: Game = new Game(randomUUID());
    room.assignGame(game);
    games.push(game);
    return game;
}

function getGameById(id: string): Game | undefined {
    return games.find((game) => game.id === id);
}

function setShips(gameId: string, playerId: string, ships: Ship[]): void {
    const game: Game | undefined = getGameById(gameId);
    if (game) {
        game.setShipsByPlayerId(playerId, ships);
    }
}

export {
    addPlayer,
    createRoom,
    getRooms,
    joinRoom,
    createGameInRoom,
    getRoomById,
    getPlayerById,
    getGameById,
    setShips,
};
