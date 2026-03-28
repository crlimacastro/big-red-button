export type Player = {
  name: string;
};

export type Room = {
  code: string;
  players: Player[];
  hostName: string,
  buzzedClientName: string | null;
};

export type PlayerInRoomData = { player: Player; room: Room } | null;
