-- Regras do apelido (o app valida também, mas o banco é quem garante):
-- 3 a 20 caracteres, só letras sem acento, números e _.
-- Apelido vazio continua permitido (conta recém-criada, antes de escolher).
alter table public.profiles
  add constraint profiles_nickname_format
  check (nickname ~ '^[A-Za-z0-9_]{3,20}$');

-- Único sem diferenciar maiúsculas: "Maria" e "maria" contam como o mesmo apelido.
create unique index profiles_nickname_lower_idx
  on public.profiles (lower(nickname));
