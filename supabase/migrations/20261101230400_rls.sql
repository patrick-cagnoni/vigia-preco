alter table public.profiles      enable row level security;
alter table public.categories    enable row level security;
alter table public.products      enable row level security;
alter table public.stores        enable row level security;
alter table public.price_reports enable row level security;

-- O Supabase concede tudo por padrão às roles anon/authenticated.
-- Tiramos escrita de tudo e devolvemos só por coluna, para ninguém
-- se promover a moderador ou inflar o score de confiança.
revoke insert, update, delete on
  public.profiles, public.categories, public.products, public.stores, public.price_reports
  from anon, authenticated;

-- Leitura pública
create policy "read profiles"   on public.profiles      for select using (true);
create policy "read categories" on public.categories    for select using (true);
create policy "read products"   on public.products      for select using (status = 'active');
create policy "read stores"     on public.stores        for select using (true);
create policy "read prices"     on public.price_reports for select using (status = 'active');

-- profiles: o dono só altera o apelido
grant update (nickname) on public.profiles to authenticated;
create policy "update own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- products: qualquer usuário logado cadastra, em seu nome
grant insert (gtin, name, brand, category_id, unit, quantity, photo_url, created_by)
  on public.products to authenticated;
create policy "insert product" on public.products
  for insert to authenticated
  with check (created_by = (select auth.uid()));

-- stores: qualquer usuário logado cadastra um mercado
grant insert (name, chain, address, uf, location, external_place_id)
  on public.stores to authenticated;
create policy "insert store" on public.stores
  for insert to authenticated
  with check (true);

-- price_reports: só insert, em nome próprio; sem update/delete para usuários
grant insert (product_id, store_id, user_id, price, kind, observed_at)
  on public.price_reports to authenticated;
create policy "insert own price" on public.price_reports
  for insert to authenticated
  with check (user_id = (select auth.uid()));
