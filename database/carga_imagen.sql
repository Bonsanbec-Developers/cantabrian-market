-- Crear la política
create policy "upload_own_folder_only"
on storage.objects
as permissive
for insert
to authenticated
with check (
  bucket_id = 'productos' AND
  -- el path debe empezar con el UID del usuario seguido de '/'
  path_tokens[1] = auth.uid()::text
);