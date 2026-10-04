-- Run in Supabase > SQL Editor
create table products (
  id serial primary key,
  name text not null,
  description text,
  price int not null,            -- naira
  emoji text default '🍹',
  in_stock boolean default true
);
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  email text, name text, phone text, address text,
  total int not null,
  status text default 'placed',
  created_at timestamptz default now()
);
create table order_items (
  id serial primary key,
  order_id uuid references orders(id) on delete cascade,
  product_id int, name text, qty int, unit_price int
);

alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create policy "anyone reads products" on products for select using (true);
create policy "own orders" on orders for select using (auth.uid() = user_id);
create policy "own order items" on order_items for select
  using (exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid()));
-- No insert policies: orders are created only through place_order(), which prices from the DB.

create or replace function place_order(p_items jsonb, p_name text, p_phone text, p_address text)
returns uuid language plpgsql security definer set search_path = public as $$
declare oid uuid; tot int := 0; it jsonb; prod products;
begin
  if auth.uid() is null then raise exception 'sign in required'; end if;
  insert into orders(user_id, email, name, phone, address, total)
    values (auth.uid(), auth.jwt()->>'email', p_name, p_phone, p_address, 0) returning id into oid;
  for it in select * from jsonb_array_elements(p_items) loop
    select * into prod from products where id = (it->>'id')::int and in_stock;
    if not found or (it->>'qty')::int < 1 then raise exception 'bad item'; end if;
    insert into order_items(order_id, product_id, name, qty, unit_price)
      values (oid, prod.id, prod.name, (it->>'qty')::int, prod.price);
    tot := tot + prod.price * (it->>'qty')::int;
  end loop;
  update orders set total = tot where id = oid;
  return oid;
end $$;
grant execute on function place_order to authenticated;

insert into products(name, description, price, emoji) values
 ('Zobo, 1 litre', 'Hibiscus, ginger and cloves. Chilled, no preservatives.', 1500, '🌺'),
 ('Chin chin, 500g', 'Crunchy, lightly sweet, fried fresh.', 2500, '🍪'),
 ('Puff puff, 12 pcs', 'Soft and golden. Baked-to-order.', 2000, '🟡'),
 ('Kunu, 1 litre', 'Millet and ginger, made in the morning.', 1200, '🥛'),
 ('Groundnut, 400g', 'Roasted with a little salt.', 1800, '🥜'),
 ('Party pack', 'Zobo, chin chin and puff puff for 10 people.', 12000, '🎉');
