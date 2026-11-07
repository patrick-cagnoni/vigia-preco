-- Mercados num raio (metros) a partir de um ponto, do mais próximo ao mais distante.
create function public.stores_nearby(lat float8, lng float8, radius_m int default 5000)
returns table (
  id uuid,
  name text,
  chain text,
  address text,
  uf char(2),
  distance_m float8
)
language sql
stable
set search_path = public, extensions
as $$
  select s.id, s.name, s.chain, s.address, s.uf,
         st_distance(s.location, st_point(lng, lat)::geography) as distance_m
  from public.stores s
  where st_dwithin(s.location, st_point(lng, lat)::geography, radius_m)
  order by distance_m
$$;
