<script>
  import { carrito, agregar, quitarUno, cargarCarrito } from '$lib/store';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
	import Loading from '../../components/Loading.svelte';
  let showModal = false;
  let numeroTarjeta = '';
  let fechaExpiracion = '';
  let cvv = '';
  let pagoExitoso = false;
  let cargando = true;
  let mensajeError = '';

  $: total = $carrito.reduce((t, p) => t + p.precio * p.cantidad, 0);

  function abrirModal() {
    showModal = true;
    pagoExitoso = false;
    numeroTarjeta = '';
    fechaExpiracion = '';
    cvv = '';
    mensajeError = '';
  }

  async function confirmarPago() {
    // Validaciones con expresiones regulares
    const tarjetaRegex = /^(\d{4}\s?){4}$/;
    const fechaRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const cvvRegex = /^\d{3,4}$/;

    if (!tarjetaRegex.test(numeroTarjeta.trim())) {
      alert('Número de tarjeta inválido. Debe contener 16 dígitos, opcionalmente separados por espacios cada 4 dígitos.');
      return;
    }

    if (!fechaRegex.test(fechaExpiracion.trim())) {
      alert('Fecha de expiración inválida. Debe tener el formato MM/AA y un mes válido.');
      return;
    }

    if (!cvvRegex.test(cvv.trim())) {
      alert('CVV inválido. Debe contener 3 o 4 dígitos.');
      return;
    }

    mensajeError = '';
    try {
      // Llamada RPC a pagar
      const { error } = await supabase.rpc('pagar', {
        numero_tarjeta: numeroTarjeta,
        fecha_expiracion: fechaExpiracion,
        cvv: cvv
      });
      if (error) {
        mensajeError = error.message;
        return;
      }
      // Actualizar carrito con datos retornados
      await cargarCarrito();
      pagoExitoso = true;
      setTimeout(() => {
        showModal = false;
      }, 2000);
    } catch (err) {
      mensajeError = 'Error inesperado al procesar el pago.';
    }
  }

  function cerrarModal() {
    showModal = false;
  }

  onMount(async () => {
    await cargarCarrito();
    cargando = false;
  })
</script>

<svelte:head>
	<title>Mi carrito - Cantabrian Market</title>
</svelte:head>

<div class="lg:w-1/2 h-full mx-auto my-auto pt-12">
    <h1 class="text-3xl font-bold mb-6">Carrito</h1>
    {#if cargando}
        <Loading/>
    {:else if $carrito.length === 0}
      <p class="text-gray-600">Tu carrito está vacío.</p>
    {:else}
      <div class="grid gap-6">
        {#each $carrito as p}
          <div class="flex flex-col sm:flex-row items-center bg-white rounded-lg shadow-md p-6 sm:p-8 w-full">
            <img src={p.imagen} alt={p.nombre} class="w-28 h-28 object-cover rounded-md mb-6 sm:mb-0 sm:mr-10 flex-shrink-0" />
            <div class="flex-1 w-full">
              <h2 class="text-lg font-semibold mb-2">{p.nombre}</h2>
              <p class="text-gray-700 mb-3">Precio unitario: ${p.precio.toFixed(2)}</p>
              <div class="flex items-center space-x-6">
                <button
                  class="bg-gradient-to-b from-yellow-400 to-yellow-600 text-white rounded px-5 py-2 font-bold hover:brightness-110 transition text-xl sm:text-2xl"
                  on:click={() => quitarUno(p.id)}
                  aria-label="Quitar uno"
                >-</button>
                <span class="font-semibold text-xl sm:text-2xl">{p.cantidad}</span>
                <button
                  class="bg-gradient-to-b from-yellow-400 to-yellow-600 text-white rounded px-5 py-2 font-bold hover:brightness-110 transition text-xl sm:text-2xl"
                  on:click={() => agregar(p.id)}
                  aria-label="Agregar uno"
                >+</button>
              </div>
            </div>
            <div class="mt-6 sm:mt-0 sm:ml-10 text-right w-28 flex-shrink-0">
              <p class="text-gray-900 font-semibold text-lg">Subtotal</p>
              <p class="text-gray-800 font-bold text-xl">${(p.precio * p.cantidad).toFixed(2)}</p>
            </div>
          </div>
        {/each}
      </div>
      <div class="mt-8 bg-yellow-100 p-6 rounded-lg text-right">
        <p class="text-3xl font-extrabold text-yellow-800">Total: ${total.toFixed(2)}</p>
        <button
          on:click={abrirModal}
          class="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded shadow transition"
        >
          Pagar con tarjeta
        </button>
      </div>
    {/if}
</div>

{#if showModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg w-11/12 max-w-md p-6 relative">
      <button
        on:click={cerrarModal}
        class="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-xl font-bold"
        aria-label="Cerrar modal"
      >&times;</button>
      {#if !pagoExitoso}
        <h2 class="text-2xl font-semibold mb-4 text-yellow-700">Datos de la tarjeta</h2>
        <form on:submit|preventDefault={confirmarPago} class="space-y-4">
          <div>
            <label for="numeroTarjeta" class="block text-gray-700 font-semibold mb-1">Número de tarjeta</label>
            <input
              id="numeroTarjeta"
              type="text"
              maxlength="19"
              placeholder="1234 5678 9012 3456"
              bind:value={numeroTarjeta}
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>
          <div>
            <label for="fechaExpiracion" class="block text-gray-700 font-semibold mb-1">Fecha de expiración</label>
            <input
              id="fechaExpiracion"
              type="text"
              maxlength="5"
              placeholder="MM/AA"
              bind:value={fechaExpiracion}
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>
          <div>
            <label for="cvv" class="block text-gray-700 font-semibold mb-1">CVV</label>
            <input
              id="cvv"
              type="password"
              maxlength="4"
              placeholder="123"
              bind:value={cvv}
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>
          <button
            type="submit"
            class="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded shadow transition"
          >
            Confirmar pago
          </button>
          {#if mensajeError}
            <p class="mt-2 text-red-700 bg-red-100 p-2 rounded">{mensajeError}</p>
          {/if}
        </form>
      {:else}
        <div class="text-center py-10">
          <svg class="mx-auto mb-4 w-16 h-16 text-green-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
          <h3 class="text-xl font-semibold text-green-700 mb-2">Pago exitoso</h3>
          <p class="text-gray-700">Gracias por tu compra.</p>
        </div>
      {/if}
    </div>
  </div>
{/if}