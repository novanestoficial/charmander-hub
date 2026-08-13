-- Destaque no catálogo: os scripts marcados sobem pro topo da grade e ganham
-- selo + brilho no card. Mesma ideia do has_key — flag no banco em vez de slug
-- fixo no código, pra dar/tirar destaque sem deploy.
alter table public.scripts
  add column if not exists featured boolean not null default false;

update public.scripts set featured = true where slug in ('dropkick', 'explhub');
