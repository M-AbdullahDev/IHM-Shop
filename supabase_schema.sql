-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Inventory Table
create table if not exists public.inventory (
    id text primary key,
    name text not null,
    type text not null,
    style text,
    size text,
    color text,
    quantity integer not null default 0,
    price numeric not null default 0,
    costPrice numeric not null default 0,
    minSellingPrice numeric not null default 0,
    lowStock integer not null default 5,
    shop text not null,
    category text default 'clothing', -- 'clothing' or 'accessories'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Sales Table
create table if not exists public.sales (
    id text primary key,
    receiptNumber text not null,
    total numeric not null default 0,
    discount numeric default 0,
    timestamp text not null,
    type text default 'retail',
    profit numeric default 0,
    profitPercent numeric default 0,
    totalCost numeric default 0,
    totalMargin numeric default 0,
    totalMarginPercent numeric default 0,
    itemsMargin jsonb,
    shop text,
    cashier text,
    items jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Returns Table
create table if not exists public.returns (
    id text primary key,
    saleId text not null,
    totalAmount numeric not null,
    reason text,
    timestamp text not null,
    items jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Udhaar Ledger Table (Customers)
create table if not exists public.udhaar_ledger (
    id text primary key,
    name text not null,
    contact text,
    shop text not null,
    initialCredit numeric default 0,
    balance numeric default 0,
    createdAt text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Udhaar Transactions Table
create table if not exists public.udhaar_transactions (
    id text primary key,
    ledgerId text not null references public.udhaar_ledger(id) on delete cascade,
    amount numeric not null,
    type text not null, -- 'credit' or 'payment'
    date text not null,
    receiptId text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Disable RLS for now so the client can read/write without auth (or we can just use anon key)
alter table public.inventory disable row level security;
alter table public.sales disable row level security;
alter table public.returns disable row level security;
alter table public.udhaar_ledger disable row level security;
alter table public.udhaar_transactions disable row level security;
