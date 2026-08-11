create table if not exists public.copy_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table public.copy_log enable row level security;
-- Sem policies pra anon/authenticated: só o service role (servidor) le essa tabela.

create or replace function public.log_script_copy()
returns void as $$
begin
  insert into public.copy_log default values;
end;
$$ language plpgsql security definer;

grant execute on function public.log_script_copy() to anon, authenticated;
