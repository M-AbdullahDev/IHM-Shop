-- STEP 1: Disable RLS on all tables temporarily for setup
alter table shops disable row level security;
alter table profiles disable row level security;
alter table customers disable row level security;
alter table products disable row level security;
alter table sales disable row level security;
alter table sale_items disable row level security;
alter table stock_movements disable row level security;
alter table returns disable row level security;
alter table udhaar_transactions disable row level security;
alter table categories disable row level security;
