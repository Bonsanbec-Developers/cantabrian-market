<script>
  import { carrito, agregar, quitarUno } from '$lib/store';
  $: total = $carrito.reduce((t, p) => t + p.precio * p.cantidad, 0);
</script>

<div class="lg:w-1/2 h-full mx-auto my-auto pt-12">
    <h1 class="text-3xl font-bold mb-6">Carrito</h1>
    {#if $carrito.length === 0}
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
      </div>
    {/if}
</div>