<script>
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import { agregar, carrito } from '$lib/store';
	import { writable, derived } from 'svelte/store';

	/** @type {any[]} */
	let productos = [];
	let cargando = true;
	let errorMsg = '';

	// Filtros y búsqueda
	let searchQuery = '';
	let precioMin = '';
	let precioMax = '';

	// Paginación
	const itemsPorPagina = 8;
	const paginaActual = writable(1);

	onMount(async () => {
		const { data, error } = await supabase.from('productos').select('*');
		if (error) {
			console.error(error);
			errorMsg = 'No se pudieron cargar los productos.';
		} else productos = data;
		cargando = false;
	});

	// Filtrado y búsqueda
	const productosFiltrados = derived([paginaActual], () => {
		return productos.filter(
			(p) =>
				p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) &&
				(!precioMin || p.precio >= parseFloat(precioMin)) &&
				(!precioMax || p.precio <= parseFloat(precioMax))
		);
	});

	// Paginación calculada
	const paginas = derived(productosFiltrados, ($productosFiltrados) => {
		const total = Math.ceil($productosFiltrados.length / itemsPorPagina);
		return Array.from({ length: total }, (_, i) => i + 1);
	});

	/**
	 * @param {string | any[]} $productosFiltrados
	 * @param {number} $paginaActual
	 */
	function paginaSlice($productosFiltrados, $paginaActual) {
		const start = ($paginaActual - 1) * itemsPorPagina;
		return $productosFiltrados.slice(start, start + itemsPorPagina);
	}

	// Derivado para obtener cantidades de productos en el carrito por id
	const cantidadesEnCarrito = derived(carrito, ($carrito) => {
		const cantidades = {};
		for (const item of $carrito) {
			cantidades[item.id] = (cantidades[item.id] || 0) + item.cantidad;
		}
		return cantidades;
	});
</script>

<section class="mx-auto max-w-7xl px-4 py-8">
	<h1 class="mb-8 text-center text-4xl font-bold text-gray-800">Catálogo de Productos</h1>

	<!-- Barra de búsqueda y filtros -->
	<div class="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
		<input
			type="text"
			placeholder="Buscar productos..."
			bind:value={searchQuery}
			class="flex-1 rounded border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
		/>

		<div class="flex gap-2">
			<input
				type="number"
				placeholder="Min"
				bind:value={precioMin}
				class="w-20 rounded border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
			/>
			<input
				type="number"
				placeholder="Max"
				bind:value={precioMax}
				class="w-20 rounded border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
			/>
		</div>
	</div>

	{#if cargando}
		<p class="text-center text-gray-500">Cargando productos...</p>
	{:else if errorMsg}
		<p class="text-center text-red-500">{errorMsg}</p>
	{:else if productos.length === 0}
		<p class="text-center text-gray-500">No hay productos disponibles.</p>
	{:else}
		<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{#each paginaSlice($productosFiltrados, $paginaActual) as p}
				<div
					class="group relative transform overflow-hidden rounded-2xl shadow-lg transition-transform duration-300
            {$cantidadesEnCarrito[p.id]
						? 'bg-gray-50 hover:scale-105'
						: 'bg-white hover:scale-105'}"
				>
					{#if $cantidadesEnCarrito[p.id]}
						<div
							class="absolute top-2 right-2 z-10 rounded-full bg-yellow-400 px-2 py-1 text-xs font-bold text-black"
						>
							{$cantidadesEnCarrito[p.id]}
						</div>
					{/if}

					<div
						class="h-48 w-full cursor-pointer overflow-hidden"
						on:click={() => goto(`/item?id=${p.id}`)}
					>
						<img
							src={p.imagen}
							alt={p.nombre}
							class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
						/>
					</div>
					<div class="p-4">
						<h2 class="text-lg font-semibold text-gray-800">{p.nombre}</h2>
						<p class="mt-1 h-14 overflow-hidden text-sm text-gray-500">{p.descripcion}</p>
						<div class="mt-4 flex items-center justify-between">
							<span class="text-xl font-bold text-gray-900">${p.precio}</span>

							{#if $cantidadesEnCarrito[p.id]}
								<div class="flex items-center gap-2">
									<button
										class="rounded bg-gray-200 px-2 py-1 text-gray-800 hover:bg-gray-300"
										on:click={() => quitarUno(p.id)}>-</button
									>
									<span class="font-semibold">{$cantidadesEnCarrito[p.id]}</span>
									<button
										class="rounded bg-blue-600 px-2 py-1 text-white hover:bg-blue-700"
										on:click={() => agregar(p)}>+</button
									>
								</div>
							{:else}
								<button
									class="rounded-lg bg-blue-600 px-4 py-2 text-white shadow transition-colors hover:bg-blue-700"
									on:click={() => agregar(p)}
								>
									Añadir
								</button>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Paginación -->
		<div class="mt-8 flex justify-center gap-2">
			{#each $paginas as n}
				<button
					on:click={() => paginaActual.set(n)}
					class="rounded border px-3 py-1
                       {$paginaActual === n
						? 'bg-blue-600 text-white'
						: 'bg-white text-gray-700 hover:bg-gray-200'}"
				>
					{n}
				</button>
			{/each}
		</div>
	{/if}
</section>
