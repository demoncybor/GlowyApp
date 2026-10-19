-- Tipos, tablas, triggers e índices (sección 4 del documento de diseño)

create extension if not exists pg_trgm with schema extensions;

-- Enums compartidos entre perfil y producto: es lo que permite calcular la compatibilidad
create type public.skin_type as enum ('seca', 'grasa', 'mixta', 'normal', 'sensible');
create type public.skin_concern as enum (
  'acne', 'manchas', 'antiedad', 'hidratacion', 'poros', 'enrojecimiento', 'luminosidad'
);
create type public.product_category as enum (
  'limpiador', 'tonico', 'serum', 'hidratante', 'protector_solar', 'mascarilla', 'exfoliante',
  'contorno_ojos'
);
create type public.product_attribute as enum (
  'vegano', 'cruelty_free', 'sin_fragancia', 'sin_alcohol', 'no_comedogenico', 'hipoalergenico'
);
create type public.routine_slot as enum ('manana', 'noche');

create function public.set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- profiles: extiende auth.users; se crea sola al registrarse y queda incompleta hasta el onboarding
create table public.profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  display_name         text not null default '',
  skin_type            public.skin_type,
  concerns             public.skin_concern[] not null default '{}',
  budget_max           numeric(10,2) check (budget_max > 0),
  preferences          public.product_attribute[] not null default '{}',
  onboarding_completed boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create function public.handle_new_user() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- products: catálogo; los productos no se borran, se desactivan con active = false
create table public.products (
  id              uuid primary key default gen_random_uuid(),
  name            text not null check (char_length(name) between 1 and 160),
  brand           text not null,
  category        public.product_category not null,
  description     text,
  price           numeric(10,2) not null check (price >= 0),
  size_label      text,
  skin_types      public.skin_type[]         not null default '{}',
  targets         public.skin_concern[]      not null default '{}',
  attributes      public.product_attribute[] not null default '{}',
  key_ingredients text[] not null default '{}',
  image_path      text,
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create index products_category_idx   on public.products (category) where active;
create index products_price_idx      on public.products (price)    where active;
create index products_updated_idx    on public.products (updated_at);
create index products_skin_types_idx on public.products using gin (skin_types);
create index products_targets_idx    on public.products using gin (targets);
create index products_attributes_idx on public.products using gin (attributes);
create index products_name_trgm_idx  on public.products using gin (name extensions.gin_trgm_ops);
create index products_brand_trgm_idx on public.products using gin (brand extensions.gin_trgm_ops);

-- favorites: una fila por usuario y producto (idempotente)
create table public.favorites (
  user_id    uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index favorites_user_idx on public.favorites (user_id, created_at desc);

-- routine_items: producto del catálogo o producto propio con nombre libre
create table public.routine_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  product_id  uuid references public.products(id) on delete restrict,
  custom_name text check (char_length(custom_name) between 1 and 120),
  slot        public.routine_slot not null,
  step_order  smallint not null default 0,
  photo_path  text,
  notes       text,
  created_at  timestamptz not null default now(),
  unique (user_id, product_id, slot),
  check (product_id is not null or custom_name is not null),
  -- la foto solo puede apuntar a la carpeta del propio usuario
  check (photo_path is null or split_part(photo_path, '/', 1) = user_id::text)
);

create index routine_user_slot_idx on public.routine_items (user_id, slot, step_order);
