<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import Loading from '../../components/Loading.svelte';

	interface Producto {
		id: number;
		nombre: string;
		descripcion: string;
		imagen: string;
		precio: number;
	}

	interface DetalleOrden {
		producto: Producto;
		cantidad: number;
		subtotal: number;
	}

	interface Orden {
		id: number;
		detalles: DetalleOrden[];
		total: number;
		pago: number;
	}

	let ordenes: Orden[] = [];
	let loading = true;
	let error = '';

	async function fetchOrdenes() {
		try {
			const user = (await supabase.auth.getUser()).data.user;
			if (!user) {
				throw new Error('Usuario no autenticado');
			}


			const { data, error: fetchError } = await supabase
				.from('ordenes')
				.select(`
					id,
					cantidad,
					pago,
					producto:productos (
						id,
						nombre,
						descripcion,
						imagen,
						precio
					)
				`)
				.eq('user_id', user.id);

			if (fetchError) {
				throw fetchError;
			}

			if (!data) {
				ordenes = [];
				return;
			}


			const ordenesMap = new Map<number, Orden>();

			for (const fila of data) {
				const subtotal = fila.pago;
				const detalle: DetalleOrden = {
					producto: fila.producto,
					cantidad: fila.cantidad,
					subtotal
				};

				if (ordenesMap.has(fila.id)) {
					const ordenExistente = ordenesMap.get(fila.id)!;
					ordenExistente.detalles.push(detalle);
				} else {
					ordenesMap.set(fila.id, {
						id: fila.id,
						detalles: [detalle],
						total: 0,
						pago: fila.pago
					});
				}
			}


			ordenes = Array.from(ordenesMap.values()).map(o => ({ ...o, total: o.pago }));
		} catch (err) {
			error = err.message || 'Error desconocido';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		fetchOrdenes();
	});
</script>

<svelte:head>
	<title>Mis Pedidos - Cantabrian Market</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
	<h1 class="mb-8 text-center text-3xl font-bold text-gray-900">Mis Pedidos</h1>

	{#if loading}
		<Loading/>
	{:else if error}
		<p class="text-center font-semibold text-red-600">{error}</p>
	{:else if ordenes.length === 0}
		<p class="text-center font-medium text-gray-600">No tienes pedidos realizados aún.</p>
	{:else}
		<div class="mx-auto grid max-w-7xl gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
			{#each ordenes as orden}
				<div class="flex flex-col rounded-lg bg-white p-6 shadow-md">
					<h2 class="mb-4 text-xl font-semibold text-indigo-700">Pedido #{orden.id}</h2>
					<div class="max-h-96 flex-1 space-y-4 overflow-auto">
						{#each orden.detalles as detalle}
							<div class="flex items-center space-x-4 border-b pb-4">
								<img
									src={detalle.producto.imagen}
									alt={detalle.producto.nombre}
									class="h-20 w-20 rounded-md object-cover shadow-sm"
								/>
								<div class="flex-1">
									<h3 class="text-lg font-semibold text-gray-900">{detalle.producto.nombre}</h3>
									<p class="line-clamp-2 text-sm text-gray-600">{detalle.producto.descripcion}</p>
									<div class="mt-1 text-sm text-gray-700">
										<span
											>Precio unitario: <span class="font-semibold"
												>${(detalle.subtotal / detalle.cantidad).toFixed(2)}</span
											></span
										><br />
										<span>Cantidad: <span class="font-semibold">{detalle.cantidad}</span></span><br
										/>
										<span
											>Subtotal: <span class="font-semibold">${detalle.subtotal.toFixed(2)}</span
											></span
										>
									</div>
								</div>
							</div>
						{/each}
					</div>
					<div class="mt-6 border-t pt-4 text-right text-xl font-bold text-indigo-700">
						Total: ${orden.pago.toFixed(2)}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
