-- Dados de exemplo para desenvolvimento local (supabase db reset).

insert into public.categories (name) values ('Mercearia'), ('Bebidas'), ('Laticínios');
insert into public.categories (name, parent_id)
  select 'Grãos', id from public.categories where name = 'Mercearia';
insert into public.categories (name, parent_id)
  select 'Arroz', id from public.categories where name = 'Grãos';

insert into public.stores (name, chain, address, uf, location) values
  ('Mercado Exemplo Paulista', 'Rede Exemplo', 'Av. Paulista, 1000', 'SP',
     extensions.st_point(-46.6559, -23.5614)::extensions.geography),
  ('Mercado Exemplo Pinheiros', 'Rede Exemplo', 'R. dos Pinheiros, 500', 'SP',
     extensions.st_point(-46.6833, -23.5667)::extensions.geography),
  ('Atacado Exemplo Centro', null, 'R. Direita, 100', 'SP',
     extensions.st_point(-46.6339, -23.5489)::extensions.geography);

insert into public.products (gtin, name, brand, category_id, unit, quantity) values
  ('7890000000011', 'Arroz Branco Tipo 1', 'Marca Exemplo', (select id from public.categories where name = 'Arroz'), 'kg', 5),
  ('7890000000028', 'Feijão Carioca', 'Marca Exemplo', (select id from public.categories where name = 'Grãos'), 'kg', 1),
  ('7890000000035', 'Leite Integral', 'Marca Exemplo', (select id from public.categories where name = 'Laticínios'), 'l', 1);
