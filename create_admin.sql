-- Disable the trigger temporarily
alter table auth.users disable trigger on_auth_user_created;

-- Generate a UUID for the new admin user
do $$
declare
  new_admin_id uuid := gen_random_uuid();
begin
  -- Insert into auth.users
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) values (
    new_admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ihm.irfan03@gmail.com', crypt('IrfanBhai@12', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()
  );

  -- Insert directly into profiles as admin (bypassing the default 'shopkeeper' role which would fail the constraint)
  insert into public.profiles (id, full_name, email, role)
  values (new_admin_id, 'Admin IHM', 'ihm.irfan03@gmail.com', 'admin');
end $$;

-- Re-enable the trigger
alter table auth.users enable trigger on_auth_user_created;
