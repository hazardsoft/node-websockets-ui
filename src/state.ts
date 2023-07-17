import { PlayerId, Ship, Wins } from "./types.js";
import { Player } from "./model/Player.js";
import { Game } from "./model/Game.js";
import { Room } from "./model/Room.js";
import { AlreadyAuthenticated, IncorrectCredentials, UserNotFound } from "./errors.js";
import { generateGameId, generatePlayerId, generateRoomId } from "./utils/id_generator.js";
import { BotPlayer } from "./model/BotPlayer.js";

const players: Player[] = [];
const activePlayers: Player[] = [];
const rooms: Room[] = [];
const games: Game[] = [];
const gamesInRooms: Map<Room, Game> = new Map();
const winners: Map<PlayerId, Wins> = new Map();

function authPlayer(name: string, password: string): Player {
    const authPlayer = activePlayers.find((player) => player.name === name);
    if (authPlayer) throw new AlreadyAuthenticated();

    const player = players.find((player) => player.name === name);
    if (!player) throw new UserNotFound();
    if (player.password !== password.trim()) throw new IncorrectCredentials();

    return player;
}

function registerPlayer(name: string, password: string): Player {
    const player: Player = new Player(generatePlayerId(), name, password.trim());
    players.push(player);
    return player;
}

function addPlayer(player: Player): void {
    players.push(player);
}

function removePlayer(playerId: PlayerId): void {
    const index = players.findIndex((player) => player.id === playerId);
    if (index !== -1) players.splice(index, 1);
}

function addActivePlayer(player: Player): void {
    activePlayers.push(player);
}

function removeActivePlayer(playerId: PlayerId): void {
    const index = activePlayers.findIndex((player) => player.id === playerId);
    if (index !== -1) activePlayers.splice(index, 1);
}

function createRoom(): Room {
    const room: Room = new Room(generateRoomId());
    rooms.push(room);
    return room;
}

function hasGameInRoom(room: Room): boolean {
    return gamesInRooms.has(room);
}

function setGameInRoom(room: Room, game: Game): void {
    gamesInRooms.set(room, game);
}

function getGameByRoom(room: Room): Game | undefined {
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

function joinRoom(roomId: string, playerId: PlayerId): boolean {
    const room = rooms.find((room) => room.id === roomId);
    if (!room || room.isFull()) return false;
    room.addPlayer(playerId);
    return true;
}

function getRoomById(roomId: string): Room | undefined {
    return rooms.find((room) => room.id === roomId);
}

function createGame(): Game {
    const game: Game = new Game(generateGameId());
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
    let curWins = winners.has(playerId) ? winners.get(playerId)! : 0;
    winners.set(playerId, ++curWins);
}

function getWins(): Record<PlayerId, Wins> {
    const winRecords: Record<PlayerId, Wins> = {};
    winners.forEach((wins, playerId) => {
        winRecords[playerId] = wins;
    });
    return winRecords;
}

function isPlayerBot(playerId: PlayerId): boolean {
    const player = getPlayerById(playerId);
    return player ? player instanceof BotPlayer : true;
}

export {
    authPlayer,
    registerPlayer,
    addActivePlayer,
    addPlayer,
    removePlayer,
    isPlayerBot,
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
    getGameByRoom,
    setGameInRoom,
    removeRoomByGame,
    getGameByPlayerId,
    getPlayers,
    getWins,
};
