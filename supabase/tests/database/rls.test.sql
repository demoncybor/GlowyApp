-- Pruebas de privacidad y restricciones (sección 8). Ejecutar con: npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;
select plan(17);

-- Datos de prueba (como postgres, sin RLS)
insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'a@test.local', '{"display_name":"Usuario A"}'),
  ('22222222-2222-2222-2222-222222222222', 'b@test.local', '{"display_name":"Usuario B"}');

insert into public.products (id, name, brand, category, price) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Producto de prueba', 'Test', 'serum', 100);

insert into public.routine_items (user_id, product_id, slot) values
  ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-0000-0000-0000-000000000001', 'manana');

insert into storage.objects (bucket_id, name) values
  ('routine-photos', '22222222-2222-2222-2222-222222222222/foto.jpg');

-- 1. El registro crea el perfil incompleto
select is(
  (select onboarding_completed from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
  false, 'un usuario nuevo tiene perfil con onboarding_completed = false');
select is(
  (select display_name from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
  'Usuario A', 'el perfil toma display_name de los metadatos del registro');

-- A partir de aquí, actuar como el usuario A
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
set local role authenticated;

-- 2. Perfiles
select results_eq('select count(*)::int from public.profiles', array[1], 'A solo ve su propio perfil');
update public.profiles set display_name = 'hackeado' where id = '22222222-2222-2222-2222-222222222222';
select throws_ok(
  $$ insert into public.profiles (id) values ('33333333-3333-3333-3333-333333333333') $$,
  '42501', null, 'A no puede crear perfiles');

-- 3. Catálogo
select isnt_empty('select id from public.products', 'un usuario autenticado lee el catálogo');
select throws_ok(
  $$ insert into public.products (name, brand, category, price) values ('x', 'y', 'serum', 1) $$,
  '42501', null, 'no puede insertar en products');
select throws_ok(
  $$ update public.products set price = 0 $$,
  '42501', null, 'no puede editar products');
select throws_ok(
  $$ delete from public.products $$,
  '42501', null, 'no puede borrar en products');

-- 4. Favoritos
insert into public.favorites (product_id) values ('aaaaaaaa-0000-0000-0000-000000000001')
  on conflict do nothing;
insert into public.favorites (product_id) values ('aaaaaaaa-0000-0000-0000-000000000001')
  on conflict do nothing;
select results_eq('select count(*)::int from public.favorites', array[1], 'el mismo favorito dos veces deja una sola fila');
select throws_ok(
  $$ insert into public.favorites (user_id, product_id)
     values ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-0000-0000-0000-000000000001') $$,
  '42501', null, 'A no puede insertar un favorito con el user_id de B');

-- 5. Rutina
select is_empty(
  $$ select id from public.routine_items where user_id = '22222222-2222-2222-2222-222222222222' $$,
  'A no ve la rutina de B');
insert into public.routine_items (product_id, slot) values ('aaaaaaaa-0000-0000-0000-000000000001', 'noche');
select throws_ok(
  $$ insert into public.routine_items (product_id, slot) values ('aaaaaaaa-0000-0000-0000-000000000001', 'noche') $$,
  '23505', null, 'el mismo producto dos veces en el mismo momento del día falla');
select throws_ok(
  $$ insert into public.routine_items (slot) values ('manana') $$,
  '23514', null, 'un elemento sin product_id ni custom_name falla');
select throws_ok(
  $$ insert into public.routine_items (custom_name, slot, photo_path)
     values ('Mi crema', 'manana', '22222222-2222-2222-2222-222222222222/foto.jpg') $$,
  '23514', null, 'photo_path con la carpeta de otro usuario falla');

-- 6. Storage
select is_empty(
  $$ select name from storage.objects where bucket_id = 'routine-photos' $$,
  'A no ve las fotos de la carpeta de B');

-- Comprobaciones finales como postgres
reset role;
select is(
  (select display_name from public.profiles where id = '22222222-2222-2222-2222-222222222222'),
  'Usuario B', 'A no pudo editar el perfil de B');

-- 7. anon no tiene acceso a las tablas
set local role anon;
select throws_ok('select * from public.profiles', '42501', null, 'anon no puede leer profiles');

select * from finish();
rollback;
