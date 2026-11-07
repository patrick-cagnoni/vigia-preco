-- histórico e último preço por produto
create index price_reports_product_observed_idx
  on public.price_reports (product_id, observed_at desc);
-- preço atual de um produto em um mercado
create index price_reports_store_product_observed_idx
  on public.price_reports (store_id, product_id, observed_at desc);
-- busca por raio
create index stores_location_idx on public.stores using gist (location);
-- busca textual tolerante a erro de digitação
create index products_name_trgm_idx  on public.products using gin (name  extensions.gin_trgm_ops);
create index products_brand_trgm_idx on public.products using gin (brand extensions.gin_trgm_ops);
