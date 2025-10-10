<script>
  import { carrito, quitar, vaciar } from '$lib/store';
  $: total = $carrito.reduce((t, p) => t + p.precio * p.cantidad, 0);
</script>

<h1 class="text-3xl font-bold mb-4">Carrito</h1>
{#if $carrito.length === 0}
  <p>Tu carrito está vacío.</p>
{:else}
  <ul class="space-y-4">
    {#each $carrito as p}
      <li class="flex items-center justify-between border-b pb-2">
        <span>{p.nombre} x{p.cantidad}</span>
        <span>${p.precio * p.cantidad}</span>
        <button class="text-red-500" on:click={() => quitar(p.id)}>🗑</button>
      </li>
    {/each}
  </ul>
  <div class="mt-4">
    <p class="font-semibold">Total: ${total}</p>
    <button class="bg-green-600 text-white rounded px-3 py-1 mt-2" on:click={vaciar}>Vaciar carrito</button>
  </div>
{/if}