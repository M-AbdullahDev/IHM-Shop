create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_first boolean;
  assigned_role user_role;
  assigned_shop uuid;
begin
  select not exists(select 1 from public.profiles) into is_first;
  
  if is_first then
    assigned_role := 'admin'::user_role;
  else
    assigned_role := 'shopkeeper'::user_role;
  end if;

  if new.raw_user_meta_data ? 'shop_id' then
    assigned_shop := (new.raw_user_meta_data ->> 'shop_id')::uuid;
  end if;
  
  -- If shopkeeper and no shop_id provided, default to wholesale shop to prevent constraint error
  if assigned_role = 'shopkeeper' and assigned_shop is null then
    select id into assigned_shop from shops where name = 'Wholesale Shop' limit 1;
  end if;
  
  insert into public.profiles (id, full_name, email, role, shop_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    assigned_role,
    assigned_shop
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
