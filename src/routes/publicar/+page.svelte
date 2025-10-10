<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { goto } from '$app/navigation';

  let nombre = '';
  let descripcion = '';
  let precio = '';
  let imagen = '';

  let errorNombre = false;
  let errorDescripcion = false;
  let errorPrecio = false;
  let errorImagen = false;

  let mensaje = '';
  let mensajeError = '';

  function validarCampos() {
    errorNombre = nombre.trim() === '';
    errorDescripcion = descripcion.trim() === '';
    errorPrecio = isNaN(Number(precio)) || Number(precio) <= 0;
    errorImagen = imagen.trim() === '';

    return !(errorNombre || errorDescripcion || errorPrecio || errorImagen);
  }

  async function handleSubmit() {
    mensaje = '';
    mensajeError = '';

    if (!validarCampos()) {
      return;
    }

    const { data, error } = await supabase.rpc('publicar_producto', {
      nombre,
      descripcion,
      precio: Number(precio),
      imagen
    });

    if (error) {
      mensajeError = `Error al publicar producto: ${error.message}`;
    } else {
      mensaje = 'Producto publicado con éxito.';
      nombre = '';
      descripcion = '';
      precio = '';
      imagen = '';
      errorNombre = false;
      errorDescripcion = false;
      errorPrecio = false;
      errorImagen = false;
      goto(`/item?id=${data}`);
    }
  }

  function isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
  <div class="max-w-md w-full bg-white shadow-md rounded-lg p-8">
    <h1 class="text-3xl font-serif font-semibold mb-6 text-gray-900 text-center">Publicar Producto</h1>

    {#if mensaje}
      <div class="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
        {mensaje}
      </div>
    {/if}

    {#if mensajeError}
      <div class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {mensajeError}
      </div>
    {/if}

    <form on:submit|preventDefault={handleSubmit} class="space-y-6">
      <div>
        <label for="nombre" class="block text-gray-700 font-medium mb-1">Nombre</label>
        <input
          id="nombre"
          type="text"
          bind:value={nombre}
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-serif text-gray-900 {errorNombre ? 'border-red-500' : 'border-gray-300'}"
          placeholder="Nombre del producto"
        />
      </div>

      <div>
        <label for="descripcion" class="block text-gray-700 font-medium mb-1">Descripción</label>
        <textarea
          id="descripcion"
          rows="3"
          bind:value={descripcion}
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-serif text-gray-900 resize-none {errorDescripcion ? 'border-red-500' : 'border-gray-300'}"
          placeholder="Descripción detallada"
        ></textarea>
      </div>

      <div>
        <label for="precio" class="block text-gray-700 font-medium mb-1">Precio (MXN$)</label>
        <input
          id="precio"
          type="number"
          min="0.01"
          step="0.01"
          bind:value={precio}
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-serif text-gray-900 {errorPrecio ? 'border-red-500' : 'border-gray-300'}"
          placeholder="Precio del producto"
        />
      </div>

      <div>
        <label for="imagen" class="block text-gray-700 font-medium mb-1">URL de la imagen</label>
        <input
          id="imagen"
          type="url"
          bind:value={imagen}
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-serif text-gray-900 {errorImagen ? 'border-red-500' : 'border-gray-300'}"
          placeholder="https://ejemplo.com/imagen.jpg"
        />
        {#if imagen.trim() !== '' && isValidUrl(imagen)}
          <img src={imagen} alt="Previsualización de la imagen" class="w-full h-64 object-contain mt-2 rounded-md shadow-sm border" />
        {/if}
      </div>

      <button
        type="submit"
        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md shadow-md transition-colors duration-300 font-serif"
      >
        Agregar producto
      </button>
    </form>
  </div>
</div>
