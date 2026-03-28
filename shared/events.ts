import { type Room } from './types.ts';

type ClientReqGetRoomReason = 'join' | 'rejoin';

export interface ClientToServerEvents {
	clientReqCreateAndJoinRoom: ({}: { playerName: string }) => void;
	clientReqJoinRoom: ({}: { roomCode: string; playerName: string }) => void;
	clientReqRejoinRoom: ({}: { roomCode: string; playerName: string }) => void;
	clientReqLeaveRoom: ({}: { roomCode: string; playerName: string }) => void;
	clientReqGetRoom: ({}: { reason: ClientReqGetRoomReason; roomCode: string }) => void;
	clientReqBuzz: ({}: { roomCode: string; playerName: string }) => void;
	clientReqResetBuzz: ({}: { roomCode: string }) => void;
}

export interface ServerToClientEvents {
	serverResError: ({}: { message: string }) => void;
	serverResPlayerJoinedRoom: ({}: { playerName: string; room: Room }) => void;
	serverResGetRoom: ({}: { reason: ClientReqGetRoomReason; room: Room | null }) => void;
	serverResRoomUpdated: ({}: { room: Room }) => void;
	serverResBuzz: ({}: { good: boolean }) => void;
}
