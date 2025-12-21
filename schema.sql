-- Create manufacturers table
create table manufacturers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  contact_person text,
  phone text,
  email text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create items table
create table items (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null,
  buying_price numeric not null,
  selling_price numeric not null,
  unit text not null,
  manufacturer_id uuid references manufacturers(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
