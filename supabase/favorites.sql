create table public.script_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  script_id uuid not null references public.scripts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, script_id)
);

alter table public.script_likes enable row level security;

create policy "Users can read own likes"
  on public.script_likes for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own likes"
  on public.script_likes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own likes"
  on public.script_likes for delete
  to authenticated
  using (auth.uid() = user_id);

-- Replaces increment_likes: toggles a per-user favorite instead of an
-- anonymous global counter, so likes can back a "favoritos" list per account.
create or replace function public.toggle_like(p_slug text)
returns table(likes int, liked boolean) as $$
declare
  v_script_id uuid;
  v_user_id uuid := auth.uid();
  v_liked boolean;
  v_likes int;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select id into v_script_id from public.scripts where slug = p_slug;
  if v_script_id is null then
    raise exception 'script not found';
  end if;

  if exists (
    select 1 from public.script_likes
    where user_id = v_user_id and script_id = v_script_id
  ) then
    delete from public.script_likes
      where user_id = v_user_id and script_id = v_script_id;
    update public.scripts set likes = greatest(likes - 1, 0)
      where id = v_script_id
      returning scripts.likes into v_likes;
    v_liked := false;
  else
    insert into public.script_likes (user_id, script_id)
      values (v_user_id, v_script_id);
    update public.scripts set likes = likes + 1
      where id = v_script_id
      returning scripts.likes into v_likes;
    v_liked := true;
  end if;

  return query select v_likes, v_liked;
end;
$$ language plpgsql security definer;

grant execute on function public.toggle_like(text) to authenticated;
revoke execute on function public.increment_likes(text) from anon;
