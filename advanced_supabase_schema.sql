-- =====================================================================
-- IHM SHOP POS - SUPABASE (POSTGRESQL) SCHEMA (ADVANCED)
-- =====================================================================

-- First, drop the old basic tables if they exist to prevent type conflicts
drop table if exists public.udhaar_transactions cascade;
drop table if exists public.udhaar_ledger cascade;
drop table if exists public.returns cascade;
drop table if exists public.sales cascade;
drop table if exists public.inventory cascade;

-- ---------------------------------------------------------------------
-- 0. EXTENSIONS
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto";      -- for gen_random_uuid()

-- ---------------------------------------------------------------------
-- 1. ENUM TYPES
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('admin', 'shopkeeper');
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_method') then
    create type payment_method as enum ('cash', 'udhaar', 'card', 'mixed');
  end if;

  if not exists (select 1 from pg_type where typname = 'sale_status') then
    create type sale_status as enum ('completed', 'partially_returned', 'returned', 'voided');
  end if;

  if not exists (select 1 from pg_type where typname = 'udhaar_txn_type') then
    create type udhaar_txn_type as enum ('credit', 'payment');
  end if;

  if not exists (select 1 from pg_type where typname = 'stock_reason') then
    create type stock_reason as enum ('sale', 'return', 'restock', 'adjustment', 'transfer');
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 2. SHOPS
-- ---------------------------------------------------------------------
create table if not exists shops (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,          -- 'Wholesale Shop', 'Shop 2', 'Shop 3'
  is_wholesale  boolean not null default false,
  address       text,
  contact_phone text,
  logo_url      text,                          -- for receipt branding
  low_stock_default_threshold integer not null default 5,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. PROFILES (extends auth.users, holds role + shop assignment)
-- ---------------------------------------------------------------------
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  email       text not null unique,
  role        user_role not null default 'shopkeeper',
  shop_id     uuid references shops(id) on delete set null,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint shopkeeper_must_have_shop
    check ( role = 'admin' or shop_id is not null )
);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    'shopkeeper'   -- default; promote to admin manually afterwards
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------
-- 4. CATEGORIES
-- ---------------------------------------------------------------------
create table if not exists categories (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,   -- 'iPhone', 'Android', 'Accessories', 'Covers'
  is_accessory boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 5. PRODUCTS (inventory is per-shop)
-- ---------------------------------------------------------------------
create table if not exists products (
  id                  uuid primary key default gen_random_uuid(),
  shop_id             uuid not null references shops(id) on delete cascade,
  category_id         uuid references categories(id) on delete set null,
  model_code          text not null,             -- e.g. IMEI, SKU, or model number
  name                text not null,
  cost_price          numeric(12,2) not null check (cost_price >= 0),
  sale_price          numeric(12,2) not null check (sale_price >= 0),
  min_selling_price   numeric(12,2) not null check (min_selling_price >= 0),
  quantity            integer not null default 0 check (quantity >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  image_url           text,
  is_active           boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint min_price_not_above_sale_price check (min_selling_price <= sale_price),
  constraint unique_model_per_shop unique (shop_id, model_code)
);

create index if not exists idx_products_shop_id on products(shop_id);
create index if not exists idx_products_category_id on products(category_id);
create index if not exists idx_products_low_stock on products(shop_id, quantity);

-- ---------------------------------------------------------------------
-- 6. CUSTOMERS (for Udhaar / general reference)
-- ---------------------------------------------------------------------
create table if not exists customers (
  id          uuid primary key default gen_random_uuid(),
  shop_id     uuid not null references shops(id) on delete cascade,
  name        text not null,
  phone       text,
  address     text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_customers_shop_id on customers(shop_id);
create index if not exists idx_customers_phone on customers(phone);

-- ---------------------------------------------------------------------
-- 7. SALES (order header)
-- ---------------------------------------------------------------------
create table if not exists sales (
  id              uuid primary key default gen_random_uuid(),
  shop_id         uuid not null references shops(id) on delete restrict,
  cashier_id      uuid not null references profiles(id) on delete restrict,
  customer_id     uuid references customers(id) on delete set null,
  receipt_number  bigint generated always as identity,
  subtotal        numeric(12,2) not null check (subtotal >= 0),
  discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0),
  final_amount    numeric(12,2) not null check (final_amount >= 0),
  payment_method  payment_method not null default 'cash',
  status          sale_status not null default 'completed',
  created_at      timestamptz not null default now(),
  constraint udhaar_requires_customer
    check ( payment_method <> 'udhaar' or customer_id is not null )
);

create index if not exists idx_sales_shop_id on sales(shop_id);
create index if not exists idx_sales_customer_id on sales(customer_id);
create index if not exists idx_sales_created_at on sales(created_at);

-- ---------------------------------------------------------------------
-- 8. SALE ITEMS (order lines)
-- ---------------------------------------------------------------------
create table if not exists sale_items (
  id                  uuid primary key default gen_random_uuid(),
  sale_id             uuid not null references sales(id) on delete cascade,
  product_id          uuid not null references products(id) on delete restrict,
  quantity            integer not null check (quantity > 0),
  unit_cost_price     numeric(12,2) not null,
  unit_sale_price     numeric(12,2) not null,
  unit_min_price      numeric(12,2) not null,
  unit_final_price    numeric(12,2) not null,
  line_total          numeric(12,2) generated always as (unit_final_price * quantity) stored,
  created_at          timestamptz not null default now(),
  constraint floor_price_enforced check (unit_final_price >= unit_min_price)
);

create index if not exists idx_sale_items_sale_id on sale_items(sale_id);
create index if not exists idx_sale_items_product_id on sale_items(product_id);

-- ---------------------------------------------------------------------
-- 9. STOCK MOVEMENTS (audit trail)
-- ---------------------------------------------------------------------
create table if not exists stock_movements (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references products(id) on delete cascade,
  change_qty    integer not null,
  reason        stock_reason not null,
  reference_id  uuid,
  performed_by  uuid references profiles(id) on delete set null,
  note          text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_stock_movements_product_id on stock_movements(product_id);

-- ---------------------------------------------------------------------
-- 10. RETURNS
-- ---------------------------------------------------------------------
create table if not exists returns (
  id             uuid primary key default gen_random_uuid(),
  sale_item_id   uuid not null references sale_items(id) on delete cascade,
  sale_id        uuid not null references sales(id) on delete cascade,
  quantity       integer not null check (quantity > 0),
  reason         text not null,
  refund_amount  numeric(12,2) not null check (refund_amount >= 0),
  processed_by   uuid not null references profiles(id) on delete restrict,
  created_at     timestamptz not null default now()
);

create index if not exists idx_returns_sale_id on returns(sale_id);

-- ---------------------------------------------------------------------
-- 11. UDHAAR (CREDIT) TRANSACTIONS
-- ---------------------------------------------------------------------
create table if not exists udhaar_transactions (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  shop_id     uuid not null references shops(id) on delete cascade,
  sale_id     uuid references sales(id) on delete set null,
  type        udhaar_txn_type not null,
  amount      numeric(12,2) not null check (amount > 0),
  note        text,
  created_by  uuid not null references profiles(id) on delete restrict,
  created_at  timestamptz not null default now()
);

create index if not exists idx_udhaar_customer_id on udhaar_transactions(customer_id);
create index if not exists idx_udhaar_shop_id on udhaar_transactions(shop_id);

-- =====================================================================
-- 12. TRIGGERS: keep updated_at fresh
-- =====================================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_shops_updated_at on shops;
create trigger trg_shops_updated_at before update on shops
  for each row execute function set_updated_at();

drop trigger if exists trg_profiles_updated_at on profiles;
create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at before update on products
  for each row execute function set_updated_at();

drop trigger if exists trg_customers_updated_at on customers;
create trigger trg_customers_updated_at before update on customers
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- 13. TRIGGER: auto-decrement stock + log movement when a sale_item is added
-- ---------------------------------------------------------------------
create or replace function apply_sale_item_stock()
returns trigger language plpgsql as $$
begin
  update products
     set quantity = quantity - new.quantity
   where id = new.product_id;

  if (select quantity from products where id = new.product_id) < 0 then
    raise exception 'Insufficient stock for product %', new.product_id;
  end if;

  insert into stock_movements (product_id, change_qty, reason, reference_id, performed_by)
  values (new.product_id, -new.quantity, 'sale', new.sale_id,
          (select cashier_id from sales where id = new.sale_id));

  return new;
end;
$$;

drop trigger if exists trg_apply_sale_item_stock on sale_items;
create trigger trg_apply_sale_item_stock
  after insert on sale_items
  for each row execute function apply_sale_item_stock();

-- ---------------------------------------------------------------------
-- 14. TRIGGER: auto-restock + log movement when a return is recorded
-- ---------------------------------------------------------------------
create or replace function apply_return_stock()
returns trigger language plpgsql as $$
begin
  update products
     set quantity = quantity + new.quantity
   where id = (select product_id from sale_items where id = new.sale_item_id);

  insert into stock_movements (product_id, change_qty, reason, reference_id, performed_by, note)
  values (
    (select product_id from sale_items where id = new.sale_item_id),
    new.quantity, 'return', new.id, new.processed_by, new.reason
  );

  update sales set status = 'partially_returned' where id = new.sale_id and status = 'completed';

  return new;
end;
$$;

drop trigger if exists trg_apply_return_stock on returns;
create trigger trg_apply_return_stock
  after insert on returns
  for each row execute function apply_return_stock();

-- =====================================================================
-- 15. VIEWS
-- =====================================================================
create or replace view products_shopkeeper_view as
select
  id, shop_id, category_id, model_code, name,
  sale_price, min_selling_price, quantity, low_stock_threshold,
  is_active, created_at, updated_at
from products;

create or replace view customer_balances as
select
  c.id as customer_id,
  c.shop_id,
  c.name,
  c.phone,
  coalesce(sum(case when u.type = 'credit' then u.amount else 0 end), 0) as total_credit,
  coalesce(sum(case when u.type = 'payment' then u.amount else 0 end), 0) as total_paid,
  coalesce(sum(case when u.type = 'credit' then u.amount else -u.amount end), 0) as balance_due
from customers c
left join udhaar_transactions u on u.customer_id = c.id
group by c.id, c.shop_id, c.name, c.phone;

create or replace view low_stock_products as
select *
from products
where is_active = true
  and quantity <= low_stock_threshold;

-- =====================================================================
-- 16. ROW LEVEL SECURITY (RLS)
-- =====================================================================
create or replace function current_role_is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin' and is_active = true
  );
$$;

create or replace function current_shop_id()
returns uuid language sql stable security definer set search_path = public as $$
  select shop_id from profiles where id = auth.uid();
$$;

alter table shops enable row level security;
alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table customers enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table stock_movements enable row level security;
alter table returns enable row level security;
alter table udhaar_transactions enable row level security;

create policy shops_select on shops for select using ( current_role_is_admin() or id = current_shop_id() );
create policy shops_admin_write on shops for all using ( current_role_is_admin() ) with check ( current_role_is_admin() );

create policy profiles_select on profiles for select using ( current_role_is_admin() or id = auth.uid() );
create policy profiles_self_update on profiles for update using ( id = auth.uid() ) with check ( id = auth.uid() );
create policy profiles_admin_write on profiles for all using ( current_role_is_admin() ) with check ( current_role_is_admin() );

create policy categories_select on categories for select using ( auth.role() = 'authenticated' );
create policy categories_admin_write on categories for all using ( current_role_is_admin() ) with check ( current_role_is_admin() );

create policy products_select on products for select using ( current_role_is_admin() or shop_id = current_shop_id() );
create policy products_admin_write on products for insert with check ( current_role_is_admin() );
create policy products_admin_update on products for update using ( current_role_is_admin() ) with check ( current_role_is_admin() );
create policy products_admin_delete on products for delete using ( current_role_is_admin() );

create policy customers_select on customers for select using ( current_role_is_admin() or shop_id = current_shop_id() );
create policy customers_write on customers for insert with check ( current_role_is_admin() or shop_id = current_shop_id() );
create policy customers_update on customers for update using ( current_role_is_admin() or shop_id = current_shop_id() ) with check ( current_role_is_admin() or shop_id = current_shop_id() );

create policy sales_select on sales for select using ( current_role_is_admin() or shop_id = current_shop_id() );
create policy sales_insert on sales for insert with check ( current_role_is_admin() or shop_id = current_shop_id() );

create policy sale_items_select on sale_items for select using ( current_role_is_admin() or exists (select 1 from sales s where s.id = sale_id and s.shop_id = current_shop_id()) );
create policy sale_items_insert on sale_items for insert with check ( current_role_is_admin() or exists (select 1 from sales s where s.id = sale_id and s.shop_id = current_shop_id()) );

create policy stock_movements_select on stock_movements for select using ( current_role_is_admin() or exists (select 1 from products p where p.id = product_id and p.shop_id = current_shop_id()) );

create policy returns_select on returns for select using ( current_role_is_admin() or exists (select 1 from sales s where s.id = sale_id and s.shop_id = current_shop_id()) );
create policy returns_insert on returns for insert with check ( current_role_is_admin() or exists (select 1 from sales s where s.id = sale_id and s.shop_id = current_shop_id()) );

create policy udhaar_select on udhaar_transactions for select using ( current_role_is_admin() or shop_id = current_shop_id() );
create policy udhaar_insert on udhaar_transactions for insert with check ( current_role_is_admin() or shop_id = current_shop_id() );

-- =====================================================================
-- 17. SEED DATA
-- =====================================================================
insert into shops (name, is_wholesale, contact_phone) values
  ('Wholesale Shop', true, null),
  ('Shop 2', false, null),
  ('Shop 3', false, null)
on conflict (name) do nothing;

insert into categories (name) values
  ('iPhone'), ('Android'), ('Accessories'), ('Covers')
on conflict (name) do nothing;
