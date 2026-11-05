-- Identificador del producto en su fuente de origen (por ejemplo, el product_id de Sephora).
-- Permite reimportar el catálogo actualizando los productos existentes en lugar de duplicarlos.
alter table public.products add column external_id text unique;
