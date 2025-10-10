-- Función RPC 'pagar' en Supabase
create or replace function public.pagar(
  numero_tarjeta text,
  fecha_expiracion text,
  cvv text
)
returns void
language plpgsql
security definer
as $$
declare
    user_id uuid;
    total numeric := 0;
    saldo numeric;
begin
    -- Obtener el UID del usuario autenticado
    user_id := auth.uid();

    if user_id is null then
        raise exception 'Usuario no autenticado';
    end if;

    -- Calcular el total de la compra sumando precio * cantidad de cada producto en el carrito
    select coalesce(sum(p.precio * c.cantidad), 0)
    into total
    from public.carritos c
    join public.productos p on c.producto_id = p.id
    where c.id = user_id;

    -- Generar un número aleatorio que represente el saldo disponible del usuario
    saldo := floor(random() * 100000 + 100); -- saldo aleatorio entre 100 y 100100

    if saldo < total then
        raise exception 'Saldo insuficiente: saldo disponible % < total de la compra %', saldo, total;
    end if;

    -- Transferir cada producto del carrito a la tabla ordenes, incluyendo el total de la orden en la columna pago
    insert into public.ordenes (producto_id, cantidad, user_id, pago)
    select c.producto_id, c.cantidad, c.id, p.precio * c.cantidad
    from public.carritos c
    join public.productos p on c.producto_id = p.id
    where c.id = user_id;

    -- Vaciar carrito del usuario
    delete from public.carritos
    where id = user_id;
end;
$$;

revoke execute on function pagar(text, text, text) from public;
grant execute on function pagar(text, text, text) to authenticated;