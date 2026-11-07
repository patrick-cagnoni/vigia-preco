-- Tabelas centrais do MVP. regions, report_votes, product_edits e flags vêm em sprints futuras.

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  nickname text unique,
  reputation int not null default 0,
  role text not null default 'user' check (role in ('user', 'moderator')),
  created_at timestamptz not null default now()
);

create table public.categories (
  id bigint generated always as identity primary key,
  name text not null,
  parent_id bigint references public.categories
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  gtin text unique check (gtin ~ '^(\d{8}|\d{12,14})$'), -- nulo para itens a granel
  name text not null,
  brand text,
  category_id bigint references public.categories,
  unit text not null check (unit in ('un', 'kg', 'l')),
  quantity numeric(10,3) not null check (quantity > 0),
  photo_url text,
  created_by uuid references public.profiles default auth.uid(),
  status text not null default 'active' check (status in ('active', 'removed')),
  created_at timestamptz not null default now()
);

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  chain text,
  address text,
  uf char(2),
  location extensions.geography(Point, 4326) not null,
  external_place_id text,
  created_at timestamptz not null default now()
);

create table public.price_reports (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products,
  store_id uuid not null references public.stores,
  user_id uuid not null references public.profiles default auth.uid(),
  price numeric(10,2) not null check (price > 0 and price < 100000),
  kind text not null default 'normal' check (kind in ('normal', 'promo', 'wholesale')),
  observed_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active', 'hidden')),
  confidence real not null default 0.5,
  created_at timestamptz not null default now()
);
