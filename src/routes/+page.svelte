<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { agregar } from '$lib/store';

  /** @type {any[]} */
  let productos = [];

  let cargando = true;
  let errorMsg = "";

  onMount(async () => {
    const { data, error } = await supabase.from('productos').select('*');
    if (error) {
      console.error(error);
      errorMsg = "No se pudieron cargar los productos.";
    } else productos = data;
    cargando = false;
  });
</script>

<section class="max-w-7xl mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold mb-8 text-center text-gray-800">Catálogo de Productos</h1>

  {#if cargando}
    <p class="text-center text-gray-500">Cargando productos...</p>
  {:else if errorMsg}
    <p class="text-center text-red-500">{errorMsg}</p>
  {:else if productos.length === 0}
    <p class="text-center text-gray-500">No hay productos disponibles.</p>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {#each productos as p}
        <div class="group relative bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
          <div class="h-48 w-full overflow-hidden">
            <img src={p.imagen} alt={p.nombre} class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
          </div>
          <div class="p-4">
            <h2 class="text-lg font-semibold text-gray-800">{p.nombre}</h2>
            <p class="text-sm text-gray-500 mt-1 h-14 overflow-hidden">{p.descripcion}</p>
            <div class="mt-4 flex items-center justify-between">
              <span class="text-xl font-bold text-gray-900">${p.precio}</span>
              <button class="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
                      on:click={() => agregar(p)}>
                Añadir
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</section>