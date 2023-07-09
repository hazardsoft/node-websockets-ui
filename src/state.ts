import { randomUUID } from "node:crypto";
import { PlayerId, Ship } from "./types.js";
import { Player } from "./Player.js";
import { Game } from "./Game.js";
import { Room } from "./Room.js";

const players: Player[] = [];
const rooms: Room[] = [];
const games: Game[] = [];

function addPlayer(name: string, password: string): Player | undefined {
    const existingPlayer: Player | undefined = players.find(
        (player) => player.name === name && player.password === password
    );
    if (existingPlayer) {
        return undefined;
    }
    const player: Player = new Player(randomUUID(), name, password);
    players.push(player);
    return player;
}

function removePlayer(playerId: PlayerId): boolean {
    const playerIndex = players.findIndex((player) => player.id === playerId);
    if (playerIndex) players.splice(playerIndex, 1);
    return playerIndex !== -1;
}

function createRoom(): void {
    const room: Room = new Room(randomUUID());
    rooms.push(room);
}

function getRooms(): Room[] {
    return rooms.slice();
}

function getPlayerById(id: string): Player | undefined {
    return players.find((user) => user.id === id);
}

function joinRoom(roomId: string, player: Player): boolean {
    const room: Room | undefined = rooms.find((room) => room.id === roomId);
    if (!room || room.isFull()) return false;
    room.addPlayer(player);
    return true;
}

function getRoomById(roomId: string): Room | undefined {
    return rooms.find((room) => room.id === roomId);
}

function createGame(): Game {
    const game: Game = new Game(randomUUID());
    games.push(game);
    return game;
}

function emptyRoom(game: Game): void {
    rooms.forEach((room) => {
        if (room.hasGame() && room.getGame() === game) {
            room.removeGame();
            room.removePlayers();
            return;
        }
    });
    const gameIndex = games.indexOf(game);
    games.splice(gameIndex, 1);
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
    removePlayer,
    createRoom,
    getRooms,
    joinRoom,
    getRoomById,
    getPlayerById,
    getGameById,
    setShips,
    createGame,
    emptyRoom,
};
