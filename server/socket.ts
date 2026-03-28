import {
	createAndJoinRoom,
	getRoom,
	maybeGetRoom,
	tryJoinPlayerToRoom,
	removePlayerFromRoom,
	setOnRoomUpdated,
  buzzPlayerInRoom,
  resetBuzzedPlayerInRoom
} from './services/room.ts';
import type { Player, Room, PlayerInRoomData } from '../shared/types.ts';
import { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '../shared/events.ts';
import { io } from 'socket.io-client';

interface InterServerEvents {}

interface SocketData {
	inRoom: PlayerInRoomData;
}

type TypedServer = Server<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData
>;
type TypedSocket = Socket<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData
>;

export default function (io: TypedServer) {
	setOnRoomUpdated((room) => {
		io.to(room.code).emit('serverResRoomUpdated', { room });
	});

	io.on('connection', (socket) => {
    const id = socket.id;
		socket.data = { inRoom: null };

		socket.on('clientReqCreateAndJoinRoom', ({ playerName }) => {
			const room = createAndJoinRoom({ name: playerName });
			if (room instanceof Error) {
				socket.emit('serverResError', {
					message: `could not create room: ${room.message}`
				});
				return;
			}
			updateSocketData(socket, room.code, playerName);
			socket.emit('serverResPlayerJoinedRoom', {
				room: room,
				playerName,
			});
		});

		socket.on('clientReqJoinRoom', ({ playerName, roomCode }) => {
			const room = tryJoinPlayerToRoom({ name: playerName }, roomCode);
			if (room instanceof Error) {
				socket.emit('serverResError', {
					message: `could not join room: ${room.message}`
				});
				return;
			}
			updateSocketData(socket, roomCode, playerName);
			socket.emit('serverResPlayerJoinedRoom', {
				room: room,
				playerName,
			});
		});

		socket.on('clientReqRejoinRoom', ({ playerName, roomCode }) => {
			const room = getRoom(roomCode);
			if (room instanceof Error) {
				socket.emit('serverResError', {
					message: `could not rejoin room: ${room.message}`
				});
				return;
			}
			const player = room.players.find((p) => p.name === playerName);
      if (!player) {
        const error = tryJoinPlayerToRoom({ name: playerName }, roomCode);
			if (error instanceof Error) {
				socket.emit('serverResError', {
					message: `could not rejoin room: ${error.message}`
				});
				return;
			}
			}
			updateSocketData(socket, roomCode, playerName);
			socket.emit('serverResPlayerJoinedRoom', {
				room: room,
				playerName,
			});
		});

		socket.on('clientReqLeaveRoom', ({ playerName, roomCode }) => {
			const error = removePlayerFromRoom(playerName, roomCode);
			if (error) {
				socket.emit('serverResError', { message: error.message });
				return;
			}
			updateSocketData(socket, null, playerName);
		});

		socket.on('clientReqGetRoom', ({ reason, roomCode }) => {
			const room = maybeGetRoom(roomCode);
			socket.emit('serverResGetRoom', { reason, room });
    });

		socket.on('clientReqBuzz', ({ roomCode, playerName }) => {
			const room = maybeGetRoom(roomCode);
      if (!room) return;
      const goodBuzz = buzzPlayerInRoom(roomCode, playerName);
      socket.emit('serverResBuzz', { good: goodBuzz });
    });

		socket.on('clientReqResetBuzz', ({ roomCode }) => {
			const room = maybeGetRoom(roomCode);
      if (!room) return;
      resetBuzzedPlayerInRoom(roomCode);
		});


		socket.on('disconnect', () => {
			if (!socket.data.inRoom) return;
			removePlayerFromRoom(socket.data.inRoom.player.name, socket.data.inRoom.room.code);
			console.log(
				`player "${socket.data.inRoom.player.name}" disconnected from room "${socket.data.inRoom.room.code}"`
			);
		});
	});
}

function updateSocketData(socket: TypedSocket, roomCode: string | null, playerName: string) {
	if (socket.data.inRoom) {
		if (socket.data.inRoom.room.code !== roomCode) {
			removePlayerFromRoom(socket.data.inRoom.player.name, socket.data.inRoom.room.code);
			socket.leave(socket.data.inRoom.room.code);
			console.log(`player "${playerName}" left room "${socket.data.inRoom.room.code}"`);
		} else {
			return;
		}
	}
	if (roomCode === null) {
		socket.data.inRoom = null;
		return;
	}

	const room = getRoom(roomCode);
	if (room instanceof Error) {
		socket.emit('serverResError', {
			message: room.message
		});
		return;
	}
	socket.data.inRoom = { player: { name: playerName }, room };
  socket.join(roomCode);
	const isHost = playerName === room.hostName;
	console.log(
		`player "${playerName}" joined room "${roomCode}" as ${isHost ? '"host"' : '"guest"'}`
	);
}
