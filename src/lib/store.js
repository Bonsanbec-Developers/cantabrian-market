import { writable, get } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';

export const carrito = writable([]);


/**
 * @param {{ id: any; }} producto
 */
export async function agregar(producto) {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    carrito.update(c => {
        // @ts-ignore
        const existe = c.find(p => p.id === producto.id);
        if (existe) {
            // @ts-ignore
            existe.cantidad += 1;
        } else {
            // @ts-ignore
            c.push({ ...producto, cantidad: 1 });
        }
        return [...c];
    });

    if (userId) {
        /**
         * @type {any[]}
         */
        const c = get(carrito);
        const item = c.find(p => p.id === producto.id);
        await supabase.from('carritos').upsert({
            id: userId,
            producto_id: producto.id,
            cantidad: item.cantidad
        });
    }
}

/**
 * @param {any} id
 */
export async function quitarUno(id) {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    carrito.update(c => {
        // @ts-ignore
        const item = c.find(p => p.id === id);
        if (!item) return c;
        // @ts-ignore
        item.cantidad -= 1;
        // @ts-ignore
        if (item.cantidad <= 0) return c.filter(p => p.id !== id);
        return [...c];
    });

    if (userId) {
        /**
         * @type {any[]}
         */
        const c = get(carrito);
        const item = c.find(p => p.id === id);
        if (!item) {
            await supabase.from('carritos').delete().match({ id: userId, producto_id: id });
        } else {
            await supabase.from('carritos').upsert({ id: userId, producto_id: id, cantidad: item.cantidad });
        }
    }
}

export async function cargarCarrito() {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (userId == null) {
        carrito.set([]);
        return;
    }
    const { data, error } = await supabase
        .from('carritos')
        .select('producto_id, cantidad, productos(*)')
        .eq('id', userId);

    if (error) {
        console.error('Error cargando carrito:', error);
        return;
    }

    // Mapear a formato de store
    const carritoLocal = data.map(item => ({
        id: item.producto_id,
        cantidad: item.cantidad,
        // @ts-ignore
        nombre: item.productos.nombre,
        // @ts-ignore
        descripcion: item.productos.descripcion,
        // @ts-ignore
        precio: item.productos.precio,
        // @ts-ignore
        imagen: item.productos.imagen
    }));

    // @ts-ignore
    carrito.set(carritoLocal);
}