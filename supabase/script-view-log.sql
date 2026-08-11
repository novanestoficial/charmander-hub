-- Mesmo padrão do visit_log (site-stats.sql): log com timestamp pra dar pra
-- agrupar "hoje" / "na semana" no admin. Só o service role lê essa tabela.
create table if not exists public.script_view_log (
  id uuid primary key default gen_random_uuid(),
  script_slug text not null,
  created_at timestamptz not null default now()
);

alter table public.script_view_log enable row level security;
-- Sem policies de select/insert pra anon/authenticated: só o service role
-- (usado exclusivamente no servidor) consegue ler essa tabela.

create or replace function public.increment_views(p_slug text)
returns void as $$
begin
  update public.scripts set views = views + 1 where slug = p_slug;
  insert into public.script_view_log (script_slug) values (p_slug);
end;
$$ language plpgsql security definer;

grant execute on function public.increment_views(text) to anon, authenticated;
