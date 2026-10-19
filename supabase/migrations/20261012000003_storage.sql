-- Buckets de Storage: imágenes del catálogo (públicas, sin escritura) y fotos de rutina (privadas)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true,  5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('routine-photos', 'routine-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- routine-photos: cada usuario solo accede a su carpeta <user_id>/
create policy routine_photos_select on storage.objects
  for select to authenticated
  using (bucket_id = 'routine-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy routine_photos_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'routine-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy routine_photos_update on storage.objects
  for update to authenticated
  using (bucket_id = 'routine-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'routine-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy routine_photos_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'routine-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- product-images no tiene políticas de escritura: solo se carga desde el panel o con la clave de servicio
