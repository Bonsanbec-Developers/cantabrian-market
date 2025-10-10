<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { supabase } from '$lib/supabaseClient';
	import { cargarCarrito, carrito } from '$lib/store';
	import '../app.css';

	export const user = writable(null);
	export const showModal = writable(false);
	export const isLogin = writable(true);

	let email = '';
	let password = '';
	let errorMsg = '';

	let itemsCount = $derived.by(() => {
		let itemsCount = 0;
		$carrito.forEach((v) => {
			// @ts-ignore
			itemsCount += v.cantidad;
		});
		return itemsCount;
	});

    let itemsTotal = $derived.by(() => {
		let itemsTotal = 0;
		$carrito.forEach((v) => {
			// @ts-ignore
			itemsTotal += v.precio * v.cantidad;
		});
		return itemsTotal;
	});

	onMount(async () => {
		const {
			data: { session }
		} = await supabase.auth.getSession();
		user.set(session?.user ?? null);

		supabase.auth.onAuthStateChange((_event, session) => {
			user.set(session?.user ?? null);
			cargarCarrito();
		});

		await cargarCarrito();
	});

	async function handleLogin() {
		errorMsg = '';
		const { error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) {
			errorMsg = error.message;
		} else {
			showModal.set(false);
			email = '';
			password = '';
		}
	}

	async function handleRegister() {
		errorMsg = '';
		const { error } = await supabase.auth.signUp({ email, password });
		if (error) {
			errorMsg = error.message;
		} else {
			showModal.set(false);
			email = '';
			password = '';
		}
	}

	async function handleLogout() {
		await supabase.auth.signOut();
	}

	function openModal(login = true) {
		isLogin.set(login);
		showModal.set(true);
		errorMsg = '';
		email = '';
		password = '';
	}
</script>

<nav class="flex items-center justify-between bg-gray-100 p-4">
	<div class="flex gap-4">
		<a href="/" class="text-lg font-bold">Cantabrian Market</a>
		<a href="/" class="hover:underline">Inicio</a>
		<a href="/carrito" class="hover:underline">Carrito{itemsCount > 0 ? " (" + itemsCount + ") [$" + itemsTotal + "]": ""}</a>
        <a href="/pedidos" class="hover:underline">Pedidos</a>
        <a href="/publicar" class="hover:underline">Publicar</a>
	</div>
	<div>
		{#if $user}
			<button
				on:click={handleLogout}
				class="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600">Cerrar sesión</button
			>
		{:else}
			<button
				on:click={() => openModal(true)}
				class="mr-2 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
				>Iniciar sesión</button
			>
			<button
				on:click={() => openModal(false)}
				class="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600">Registrarse</button
			>
		{/if}
	</div>
</nav>

{#if $showModal}
	<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
		<div class="relative w-96 rounded-lg bg-white p-6">
			<button
				on:click={() => showModal.set(false)}
				class="absolute top-2 right-2 text-xl font-bold text-gray-600 hover:text-gray-900"
				>&times;</button
			>
			<h2 class="mb-4 text-2xl">{$isLogin ? 'Iniciar sesión' : 'Registrarse'}</h2>
			{#if errorMsg}
				<p class="mb-2 text-red-600">{errorMsg}</p>
			{/if}
			<form
				on:submit|preventDefault={$isLogin ? handleLogin : handleRegister}
				class="flex flex-col gap-4"
			>
				<input
					type="email"
					placeholder="Correo electrónico"
					bind:value={email}
					required
					class="rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
				<input
					type="password"
					placeholder="Contraseña"
					bind:value={password}
					required
					class="rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
				<button
					type="submit"
					class="rounded bg-blue-600 py-2 text-white transition hover:bg-blue-700"
				>
					{$isLogin ? 'Entrar' : 'Crear cuenta'}
				</button>
			</form>
			<p class="mt-4 text-center text-sm text-gray-600">
				{#if $isLogin}
					¿No tienes cuenta?
					<button on:click={() => isLogin.set(false)} class="ml-1 text-blue-600 hover:underline"
						>Regístrate</button
					>
				{:else}
					¿Ya tienes cuenta?
					<button on:click={() => isLogin.set(true)} class="ml-1 text-blue-600 hover:underline"
						>Inicia sesión</button
					>
				{/if}
			</p>
		</div>
	</div>
{/if}

<slot />
