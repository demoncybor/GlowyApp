-- Permisos y políticas RLS: cada usuario solo ve y modifica sus datos; el catálogo es de solo lectura

alter table public.profiles      enable row level security;
alter table public.products      enable row level security;
alter table public.favorites     enable row level security;
alter table public.routine_items enable row level security;

-- Permisos explícitos por tabla; el rol anon no tiene acceso a ninguna
revoke all on public.profiles, public.products, public.favorites, public.routine_items
  from anon, authenticated;

grant select, update                 on public.profiles      to authenticated;
grant select                         on public.products      to authenticated;
grant select, insert, delete         on public.favorites     to authenticated;
grant select, insert, update, delete on public.routine_items to authenticated;

-- profiles: leer y editar solo la fila propia (la crea el trigger handle_new_user)
create policy profiles_select_own on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- products: incluye inactivos para que la caché del dispositivo detecte las bajas
create policy products_read on public.products
  for select to authenticated using (true);

-- favorites
create policy favorites_select_own on public.favorites
  for select to authenticated using (user_id = (select auth.uid()));
create policy favorites_insert_own on public.favorites
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy favorites_delete_own on public.favorites
  for delete to authenticated using (user_id = (select auth.uid()));

-- routine_items
create policy routine_all_own on public.routine_items
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
