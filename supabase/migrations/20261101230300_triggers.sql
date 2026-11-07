-- Cria o perfil automaticamente quando um usuário se cadastra.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- O apelido nasce vazio: o app pede que a pessoa escolha um no onboarding.
  -- A regra de apelido único continua valendo quando ele for escolhido.
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Validações de price_reports.
create function public.price_reports_guard()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new.observed_at > now() + interval '5 minutes' then
      raise exception 'observed_at não pode estar no futuro';
    end if;
  elsif tg_op = 'UPDATE' then
    -- após 24 h o conteúdo do registro é imutável; só status/confiança mudam (moderação)
    if old.created_at < now() - interval '24 hours' and (
         new.price       is distinct from old.price
      or new.product_id  is distinct from old.product_id
      or new.store_id    is distinct from old.store_id
      or new.user_id     is distinct from old.user_id
      or new.kind        is distinct from old.kind
      or new.observed_at is distinct from old.observed_at
    ) then
      raise exception 'registro de preço não pode ser editado após 24 h; crie um novo';
    end if;
  end if;
  return new;
end;
$$;

create trigger price_reports_guard_trg
  before insert or update on public.price_reports
  for each row execute function public.price_reports_guard();
