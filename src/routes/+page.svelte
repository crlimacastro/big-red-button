<script lang="ts">
	import { io, type Socket } from 'socket.io-client';
	import type { PlayerInRoomData } from '../../shared/types';
	import { onMount } from 'svelte';
	import type { ClientToServerEvents, ServerToClientEvents } from '../../shared/events';

	let goodBuzz: HTMLAudioElement;
	let badBuzz: HTMLAudioElement;

	const playerInRoomDataKey = 'savedPlayerRoomInfo';
	function getPlayerInRoomData(): PlayerInRoomData {
		const savedPlayerRoomInfo = localStorage.getItem(playerInRoomDataKey);
		if (savedPlayerRoomInfo) {
			return JSON.parse(savedPlayerRoomInfo) as PlayerInRoomData;
		}
		return null;
	}
	function setPlayerInRoomData(info: PlayerInRoomData): void {
		localStorage.setItem(playerInRoomDataKey, JSON.stringify(info));
	}
	function clearPlayerInRoomData(): void {
		localStorage.removeItem(playerInRoomDataKey);
	}

	const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();

	// home
	let playerNameInput = $state('');
	let roomCodeInput = $state('');

	// room
	let inRoom = $state(null as PlayerInRoomData);
	let isHost = $derived(inRoom?.room.hostName === inRoom?.player.name);
	let canBuzz = $derived(inRoom?.room.buzzedClientName === null);

	onMount(() => {
		goodBuzz = new Audio('/good-buzz.mp3');
		badBuzz = new Audio('/bad-buzz.mp3');

		{
			const inRoom = getPlayerInRoomData();
			if (inRoom) {
				const { room } = inRoom;
				socket.emit('clientReqGetRoom', { reason: 'rejoin', roomCode: room.code });
			}
		}

		socket.on('serverResError', ({ message }) => {
			alert(message);
		});

		socket.on('serverResPlayerJoinedRoom', ({ playerName, room }) => {
			inRoom = { player: { name: playerName }, room };
			setPlayerInRoomData(inRoom);
		});

		socket.on('serverResGetRoom', ({ reason, room }) => {
			switch (reason) {
				case 'rejoin': {
					if (room) {
						const inRoom = getPlayerInRoomData();
						if (inRoom) {
							socket.emit('clientReqRejoinRoom', {
								playerName: inRoom!.player.name,
								roomCode: room.code
							});
						}
					}
					clearPlayerInRoomData();
					break;
				}
			}
		});

		socket.on('serverResRoomUpdated', ({ room }) => {
			if (inRoom) {
				inRoom.room = room;
			}
		});

		socket.on('serverResBuzz', ({ good }) => {
			if (good) {
				goodBuzz?.play();
			} else {
				badBuzz?.play();
			}
		});
	});
</script>

{#if inRoom}
	<div
		class="mx-auto flex h-screen w-[50%] min-w-72 flex-col items-center justify-center gap-8 text-2xl"
	>
		<div class="flex flex-col items-center gap-4">
			<h1>
				Name: {inRoom.player.name}
				{#if isHost}
					(Host){/if}
			</h1>
			<div class="flex flex-col gap-2">
				<h1>Room: {inRoom.room.code.toUpperCase()}</h1>
				<button
					class="btn"
					onclick={() => {
						if (!inRoom) return;
						socket.emit('clientReqLeaveRoom', {
							playerName: inRoom.player.name,
							roomCode: inRoom.room.code
						});
						inRoom = null;
						clearPlayerInRoomData();
					}}>Leave Room</button
				>
			</div>
		</div>
		{#if isHost}
			{#if inRoom.room.buzzedClientName}
				<p>{inRoom.room.buzzedClientName} buzzed first!</p>
				<button
					class="btn"
					onclick={() => {
						if (!inRoom) return;
						socket.emit('clientReqResetBuzz', {
							roomCode: inRoom.room.code
						});
					}}>Reset</button
				>
			{:else}
				<p>Waiting for a buzz...</p>
			{/if}
			{#if inRoom.room.players.length > 1}
				<p>Other Players In Room:</p>
				<ul>
					{#each inRoom.room.players as { name }}
						{#if name !== inRoom.player.name}
							<li>{name}</li>
						{/if}
					{/each}
				</ul>
			{:else}
				<p>No other players in this room.</p>
			{/if}
		{:else}
			<button
				class="aspect-square w-64 rounded-full bg-primary text-transparent drop-shadow-md drop-shadow-primary transition-all duration-75 select-none active:translate-y-1.5 active:scale-y-99 active:drop-shadow-sm disabled:brightness-75"
				disabled={!canBuzz}
				onclick={() => {
					if (!inRoom) return;
					socket.emit('clientReqBuzz', {
						roomCode: inRoom.room.code,
						playerName: inRoom.player.name
					});
				}}>buzz</button
			>
			{#if inRoom.room.buzzedClientName !== null}
				{#if inRoom.room.buzzedClientName === inRoom.player.name}
					<p>You buzzed in time!</p>
				{:else}
					<p>You did not buzz in time. Buzzed by: {inRoom.room.buzzedClientName}</p>
				{/if}
			{/if}
		{/if}
	</div>
{:else}
	<div
		class="mx-auto flex h-screen w-[50%] min-w-72 flex-col items-center justify-center gap-8 text-2xl"
	>
		<h1 class="text-primary">Bubby Quiz</h1>
		<div class="flex flex-col gap-4">
			<label for="name">Write your name</label>
			<input type="text" id="name" placeholder="Name" bind:value={playerNameInput} />

			<div class="flex flex-col gap-2">
				<p>Then create a new room</p>
				<button
					onclick={() => {
						const playerName = playerNameInput.trim();
						if (!playerName) return;
						socket.emit('clientReqCreateAndJoinRoom', { playerName });
					}}
					class="btn">Create Room</button
				>
				<p>Or join an existing room</p>
				<div class="flex gap-1">
					<input type="text" id="code" placeholder="Code" bind:value={roomCodeInput} />
					<button
						onclick={() => {
							const playerName = playerNameInput.trim();
							const roomCode = roomCodeInput.trim().toLowerCase();
							if (!playerName || !roomCode) return;
							socket.emit('clientReqJoinRoom', { playerName, roomCode });
						}}
						class="btn">Join</button
					>
				</div>
			</div>
		</div>
	</div>
{/if}
