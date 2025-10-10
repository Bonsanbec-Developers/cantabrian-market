import { writable } from 'svelte/store';

export const carrito = writable([]);

/**
 * @param {{ id: any; }} producto
 */
export function agregar(producto) {
  carrito.update(c => {
    const existe = c.find(p => p.id === producto.id);
    if (existe) existe.cantidad += 1;
    else c.push({ ...producto, cantidad: 1 });
    return [...c];
  });
}

/**
 * @param {any} id
 */
export function quitar(id) {
  carrito.update(c => c.filter(p => p.id !== id));
}

export function vaciar() {
  carrito.set([]);
}