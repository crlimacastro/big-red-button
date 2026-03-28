import type { Player, Room } from '../../shared/types.ts';

export function createAndJoinRoom(player: Player) {
	const code = generateUniqueCode();
	if (code instanceof Error) {
		return code as Error;
	}
	const room: Room = {
		code,
		players: [player],
		hostName: player.name,
		buzzedClientName: null
	};
	rooms.set(code, room);
	return room;
}

export function getRoom(code: string) {
	const room = rooms.get(code);
	if (!room) {
		return new Error(`room ${code} not found`);
	}
	return room;
}

export function maybeGetRoom(code: string) {
	return rooms.get(code) || null;
}

export function tryJoinPlayerToRoom(client: Player, roomCode: string) {
	const room = getRoom(roomCode);
	if (room instanceof Error) {
		return room;
	}
	if (room.players.some((c) => c.name === client.name)) {
		return new Error(`player with name "${client.name}" already in room`);
	}
  room.players.push(client);
  onRoomUpdated?.(room);
  return room;
}

export function removePlayerFromRoom(playerName: string, roomCode: string) {
	const room = getRoom(roomCode);
	if (room instanceof Error) {
		return room;
	}
	const index = room.players.findIndex((c) => c.name === playerName);
	if (index === -1) return;
	if (room.players.length === 1) {
		rooms.delete(room.code);
		return;
	}
	const [removedPlayer] = room.players.splice(index, 1);
	if (room.hostName === removedPlayer.name) {
		const newHost = room.players[Math.floor(Math.random() * room.players.length)];
		room.hostName = newHost.name;
  }
  if (room.buzzedClientName === removedPlayer.name) {
		room.buzzedClientName = null;
	}
  onRoomUpdated?.(room);
}

export function buzzPlayerInRoom(roomCode: string, playerName: string) {
	const room = maybeGetRoom(roomCode);
  if (!room) return false;
  if (room.buzzedClientName === playerName) return true;
	if (room.buzzedClientName) return false;
	room.buzzedClientName = playerName;
	onRoomUpdated?.(room);
	return true;
}

export function resetBuzzedPlayerInRoom(roomCode: string) {
	const room = maybeGetRoom(roomCode);
	if (!room) return;
	room.buzzedClientName = null;
	onRoomUpdated?.(room);
}

export function setOnRoomUpdated(callback: (room: Room) => void) {
	onRoomUpdated = callback;
}

const rooms = new Map<string, Room>();
let onRoomUpdated: ((room: Room) => void) | null = null;

function generateCode() {
	return Math.random().toString(36).slice(2, 6).toLowerCase();
}

function generateUniqueCode() {
	let code = generateCode();
	const maxTries = 1000;
	let tries = 0;
	while (rooms.has(code) && tries < maxTries) {
		code = generateCode();
		tries++;
	}
	if (tries >= maxTries) {
		return new Error('could not generate a unique room code');
	}
	return code;
}
