<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { supabase } from '$lib/supabaseClient';

  export const user = writable(null);
  export const showModal = writable(false);
  export const isLogin = writable(true);

  let email = '';
  let password = '';
  let errorMsg = '';

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    user.set(session?.user ?? null);

    supabase.auth.onAuthStateChange((_event, session) => {
      user.set(session?.user ?? null);
    });
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

<nav class="p-4 flex justify-between items-center bg-gray-100">
  <div class="flex gap-4">
    <a href="/" class="font-bold text-lg">Cantabrian Market</a>
    <a href="/" class="hover:underline">Inicio</a>
    <a href="/carrito" class="hover:underline">Carrito</a>
  </div>
  <div>
    {#if $user}
      <button on:click={handleLogout} class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Cerrar sesión</button>
    {:else}
      <button on:click={() => openModal(true)} class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2">Iniciar sesión</button>
      <button on:click={() => openModal(false)} class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">Registrarse</button>
    {/if}
  </div>
</nav>

{#if $showModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-96 relative">
      <button on:click={() => showModal.set(false)} class="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl font-bold">&times;</button>
      <h2 class="text-2xl mb-4">{$isLogin ? 'Iniciar sesión' : 'Registrarse'}</h2>
      {#if errorMsg}
        <p class="text-red-600 mb-2">{errorMsg}</p>
      {/if}
      <form on:submit|preventDefault={$isLogin ? handleLogin : handleRegister} class="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Correo electrónico"
          bind:value={email}
          required
          class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Contraseña"
          bind:value={password}
          required
          class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          class="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {$isLogin ? 'Entrar' : 'Crear cuenta'}
        </button>
      </form>
      <p class="mt-4 text-center text-sm text-gray-600">
        {#if $isLogin}
          ¿No tienes cuenta?
          <button on:click={() => isLogin.set(false)} class="text-blue-600 hover:underline ml-1">Regístrate</button>
        {:else}
          ¿Ya tienes cuenta?
          <button on:click={() => isLogin.set(true)} class="text-blue-600 hover:underline ml-1">Inicia sesión</button>
        {/if}
      </p>
    </div>
  </div>
{/if}

<slot />