CREATE OR REPLACE FUNCTION publicar_producto(
    nombre text,
    descripcion text,
    precio numeric,
    imagen text
) RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    nuevo_id bigint;
BEGIN
    INSERT INTO productos(nombre, descripcion, precio, imagen, visible, publicador)
    VALUES (nombre, descripcion, precio, imagen, true, auth.uid())
    RETURNING id INTO nuevo_id;
    RETURN nuevo_id;
END;
$$;

revoke execute on function publicar_producto(text, text, numeric, text) from public;
grant execute on function publicar_producto(text, text, numeric, text) to authenticated;