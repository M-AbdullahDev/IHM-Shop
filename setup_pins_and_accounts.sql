-- =====================================================================
-- 1. Remove blocking constraint and update trigger for profiles
-- =====================================================================
alter table public.profiles drop constraint if exists shopkeeper_must_have_shop;

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, shop_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'shopkeeper'::user_role),
    nullif(new.raw_user_meta_data ->> 'shop_id', '')::uuid
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        role = excluded.role,
        shop_id = excluded.shop_id;
  return new;
end;
$$;

-- =====================================================================
-- 2. Configure Passwords & Accounts for Admin and all Shops
-- =====================================================================
do $$
declare
  uid uuid;
  sid uuid;
begin
  -- 1. Admin: ihm.irfan03@gmail.com -> admin@irfan
  update auth.users 
  set encrypted_password = crypt('admin@irfan', gen_salt('bf'))
  where email = 'ihm.irfan03@gmail.com';

  -- 2. Wholesale Shop: wholesale@ihm.com -> Wholesale@
  select id into sid from public.shops where name = 'Wholesale Shop' limit 1;
  if not exists (select 1 from auth.users where email = 'wholesale@ihm.com') then
    uid := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) values (
      '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
      'wholesale@ihm.com', crypt('Wholesale@', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Wholesale Staff"}', now(), now()
    );
    insert into public.profiles (id, full_name, email, role, shop_id)
    values (uid, 'Wholesale Staff', 'wholesale@ihm.com', 'shopkeeper', sid)
    on conflict (id) do update set shop_id = sid, role = 'shopkeeper';
  else
    update auth.users set encrypted_password = crypt('Wholesale@', gen_salt('bf')) where email = 'wholesale@ihm.com';
    select id into uid from auth.users where email = 'wholesale@ihm.com';
    insert into public.profiles (id, full_name, email, role, shop_id)
    values (uid, 'Wholesale Staff', 'wholesale@ihm.com', 'shopkeeper', sid)
    on conflict (id) do update set shop_id = sid, role = 'shopkeeper';
  end if;

  -- 3. Shop 2: shop2@ihm.com -> shop2@
  select id into sid from public.shops where name = 'Shop 2' limit 1;
  if not exists (select 1 from auth.users where email = 'shop2@ihm.com') then
    uid := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) values (
      '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
      'shop2@ihm.com', crypt('shop2@', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Shop 2 Staff"}', now(), now()
    );
    insert into public.profiles (id, full_name, email, role, shop_id)
    values (uid, 'Shop 2 Staff', 'shop2@ihm.com', 'shopkeeper', sid)
    on conflict (id) do update set shop_id = sid, role = 'shopkeeper';
  else
    update auth.users set encrypted_password = crypt('shop2@', gen_salt('bf')) where email = 'shop2@ihm.com';
    select id into uid from auth.users where email = 'shop2@ihm.com';
    insert into public.profiles (id, full_name, email, role, shop_id)
    values (uid, 'Shop 2 Staff', 'shop2@ihm.com', 'shopkeeper', sid)
    on conflict (id) do update set shop_id = sid, role = 'shopkeeper';
  end if;

  -- 4. Shop 3: shop3@ihm.com -> shop3@
  select id into sid from public.shops where name = 'Shop 3' limit 1;
  if not exists (select 1 from auth.users where email = 'shop3@ihm.com') then
    uid := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) values (
      '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
      'shop3@ihm.com', crypt('shop3@', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Shop 3 Staff"}', now(), now()
    );
    insert into public.profiles (id, full_name, email, role, shop_id)
    values (uid, 'Shop 3 Staff', 'shop3@ihm.com', 'shopkeeper', sid)
    on conflict (id) do update set shop_id = sid, role = 'shopkeeper';
  else
    update auth.users set encrypted_password = crypt('shop3@', gen_salt('bf')) where email = 'shop3@ihm.com';
    select id into uid from auth.users where email = 'shop3@ihm.com';
    insert into public.profiles (id, full_name, email, role, shop_id)
    values (uid, 'Shop 3 Staff', 'shop3@ihm.com', 'shopkeeper', sid)
    on conflict (id) do update set shop_id = sid, role = 'shopkeeper';
  end if;
end $$;
