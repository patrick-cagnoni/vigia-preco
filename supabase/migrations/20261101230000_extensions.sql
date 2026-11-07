-- Extensões usadas pelo app. pg_cron entra na migração das views materializadas.
create extension if not exists postgis  with schema extensions;
create extension if not exists pg_trgm  with schema extensions;
create extension if not exists unaccent with schema extensions;
