<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { supabase } from '$lib/supabaseClient';
  import { get } from 'svelte/store';
  import { carrito, agregar, quitarUno } from '$lib/store'; // Importa los stores necesarios
  import { derived } from 'svelte/store';
	import Loading from '../../components/Loading.svelte';

  let product: { imagen: any; nombre: any; descripcion: any; precio: number; id: string } | null = null;
  let loading = true;

  onMount(async () => {
    const id = get(page).url.searchParams.get('id');
    if (id) {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('id', id)
        .single();

      if (!error) {
        product = data;
      }
    }
    loading = false;
  });

  // Deriva la cantidad del producto en el carrito
  const cantidad = derived(carrito, ($carrito) => {
    if (!product) return 0;
    const item = $carrito.find(i => i.id === product.id);
    return item ? item.cantidad : 0;
  });
</script>

{#if loading}
  <Loading/>
{:else if product}
  <div class="min-h-screen bg-gradient-to-r from-purple-100 via-pink-100 to-yellow-100 p-6 flex flex-col md:flex-row max-w-7xl mx-auto shadow-lg rounded-lg">
    <div class="md:w-1/2 flex justify-center items-center p-4">
      <img
        src={product.imagen}
        alt={product.nombre}
        class="max-w-full max-h-[400px] rounded-lg shadow-md object-contain"
      />
    </div>
    <div class="md:w-1/2 p-6 flex flex-col justify-center">
      <div>
        <h1 class="text-4xl font-extrabold text-gray-900 mb-4 drop-shadow-sm">{product.nombre}</h1>
        <p class="text-gray-700 mb-6 whitespace-pre-line">{product.descripcion}</p>
      </div>
      <div class="mt-6 flex flex-col md:flex-row md:items-center md:space-x-8">
        <p class="text-3xl font-bold text-green-700 mb-4 md:mb-0">${product.precio.toFixed(2)}</p>
        {#if $cantidad > 0}
          <div class="inline-flex items-center h-12 bg-white rounded-lg shadow-md p-1 space-x-4">
            <button
              class="bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-semibold px-5 rounded-l-lg shadow-md transition duration-300 select-none flex items-center justify-center"
              style="min-width: 44px;"
              on:click={() => quitarUno(product.id)}
              aria-label="Quitar uno del carrito"
            >
              −
            </button>
            <span class="text-lg font-semibold text-gray-900 select-none px-4">{ $cantidad }</span>
            <button
              class="bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-semibold px-5 rounded-r-lg shadow-md transition duration-300 select-none flex items-center justify-center"
              style="min-width: 44px;"
              on:click={() => agregar(product)}
              aria-label="Añadir uno al carrito"
            >
              +
            </button>
          </div>
        {:else}
          <button
            class="w-full md:w-auto bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300"
            on:click={() => agregar(product)}
            aria-label="Añadir al carrito"
          >
            Añadir al carrito
          </button>
        {/if}
      </div>
    </div>
  </div>
{:else}
  <div class="flex justify-center items-center h-screen text-red-600 font-semibold">
    Producto no encontrado.
  </div>
{/if}
