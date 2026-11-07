begin;
create extension if not exists pgtap with schema extensions;
select plan(10);

-- usuários de teste (o gatilho cria os perfis)
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'a@example.com'),
  ('00000000-0000-0000-0000-00000000000b', 'b@example.com');

select ok(
  (select count(*) from public.profiles
    where id in ('00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000000b')) = 2,
  'gatilho cria perfil no cadastro'
);

-- anônimo
set local role anon;

select ok((select count(*) from public.products) > 0, 'anon lê produtos');
select ok((select count(*) from public.stores) > 0, 'anon lê mercados');
select throws_ok(
  $$insert into public.price_reports (product_id, store_id, user_id, price)
    values ((select id from public.products limit 1), (select id from public.stores limit 1),
            '00000000-0000-0000-0000-00000000000a', 5.99)$$,
  '42501', null, 'anon não registra preço'
);

-- usuário A autenticado
reset role;
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);

select lives_ok(
  $$insert into public.price_reports (product_id, store_id, price)
    values ((select id from public.products limit 1), (select id from public.stores limit 1), 5.99)$$,
  'usuário registra preço em nome próprio'
);
select throws_ok(
  $$insert into public.price_reports (product_id, store_id, user_id, price)
    values ((select id from public.products limit 1), (select id from public.stores limit 1),
            '00000000-0000-0000-0000-00000000000b', 5.99)$$,
  '42501', null, 'usuário não registra preço em nome de outro'
);
select throws_ok(
  $$update public.price_reports set price = 1$$,
  '42501', null, 'usuário não edita preço'
);
select throws_ok(
  $$delete from public.price_reports$$,
  '42501', null, 'usuário não apaga preço'
);
select throws_ok(
  $$insert into public.products (gtin, name, unit, quantity)
    values ('7890000000011', 'Duplicado', 'un', 1)$$,
  '23505', null, 'GTIN duplicado é rejeitado'
);
select throws_ok(
  $$update public.profiles set role = 'moderator'
    where id = '00000000-0000-0000-0000-00000000000a'$$,
  '42501', null, 'usuário não se promove a moderador'
);

select * from finish();
rollback;
