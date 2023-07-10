import { randomUUID } from "node:crypto";
import { PlayerId, Ship } from "./types.js";
import { Player } from "./model/Player.js";
import { Game } from "./model/Game.js";
import { Room } from "./model/Room.js";
import { AlreadyAuthenticated, IncorrectCredentials, UserNotFound } from "./errors.js";

const players: Player[] = [];
const activePlayers: Player[] = [];
const rooms: Room[] = [];
const games: Game[] = [];
const gamesInRooms: Map<Room, Game> = new Map();

function authPlayer(name: string, password: string): Player {
    const authPlayer = activePlayers.find((player) => player.name === name);
    if (authPlayer) throw new AlreadyAuthenticated();

    const player = players.find((player) => player.name === name);
    if (!player) throw new UserNotFound();
    if (player.password !== password.trim()) throw new IncorrectCredentials();

    return player;
}

function registerPlayer(name: string, password: string): Player {
    const player: Player = new Player(randomUUID(), name, password.trim());
    players.push(player);
    return player;
}

function addActivePlayer(player: Player): void {
    activePlayers.push(player);
}

function removeActivePlayer(playerId: PlayerId): void {
    const index = activePlayers.findIndex((player) => player.id === playerId);
    if (index !== -1) activePlayers.splice(index, 1);
}

function createRoom(): Room {
    const room: Room = new Room(randomUUID());
    rooms.push(room);
    return room;
}

function hasGameInRoom(room: Room): boolean {
    return gamesInRooms.has(room);
}

function setGameInRoom(room: Room, game: Game): void {
    gamesInRooms.set(room, game);
}

function getGameInRoom(room: Room): Game | undefined {
    return gamesInRooms.get(room);
}

function removeRoomByGame(gameToRemove: Game): void {
    for (const [room, game] of gamesInRooms.entries()) {
        if (game === gameToRemove) {
            room.removePlayers();
            gamesInRooms.delete(room);
            const roomIndex = rooms.indexOf(room);
            if (roomIndex !== -1) {
                rooms.splice(roomIndex);
            }
            return;
        }
    }
}

function getRooms(): Room[] {
    return rooms.slice();
}

function getActivePlayers(): Player[] {
    return activePlayers.slice();
}

function getPlayers(): Player[] {
    return players.slice();
}

function getPlayerById(id: string): Player | undefined {
    return players.find((player) => player.id === id);
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

function removeGame(game: Game): void {
    const gameIndex = games.indexOf(game);
    games.splice(gameIndex, 1);
}

function getGameById(id: string): Game | undefined {
    return games.find((game) => game.id === id);
}

function getGameByPlayerId(playerId: PlayerId): Game | undefined {
    return games.find((game) => game.getPlayersIds().includes(playerId));
}

function setShips(gameId: string, playerId: string, ships: Ship[]): void {
    const game: Game | undefined = getGameById(gameId);
    if (game) {
        game.setShipsByPlayerId(playerId, ships);
    }
}

function assignWinToPlayer(playerId: PlayerId): void {
    const player = getPlayerById(playerId);
    if (player) {
        player.wins++;
    }
}

export {
    authPlayer,
    registerPlayer,
    addActivePlayer,
    removeActivePlayer,
    createRoom,
    getRooms,
    joinRoom,
    getRoomById,
    getPlayerById,
    getGameById,
    setShips,
    createGame,
    removeGame,
    assignWinToPlayer,
    getActivePlayers,
    hasGameInRoom,
    getGameInRoom,
    setGameInRoom,
    removeRoomByGame,
    getPlayers,
    getGameByPlayerId,
};
