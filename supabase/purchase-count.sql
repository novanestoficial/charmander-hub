-- Public aggregate count only (no row-level purchase data leaks) — used for
-- honest social proof copy ("X pessoas já compraram") without exposing who.
create or replace function public.get_purchase_count()
returns int as $$
  select count(*)::int from public.purchases;
$$ language sql security definer stable;

grant execute on function public.get_purchase_count() to anon, authenticated;
