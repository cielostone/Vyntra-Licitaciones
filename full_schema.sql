-- Create profiles table if it doesn't exist
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  email text,
  full_name text,
  rut text,
  person_type text check (person_type in ('natural', 'juridica')),
  company_name text,
  company_rut text, -- Added this column directly
  phone text
);

-- Enable RLS
alter table profiles enable row level security;

-- Policies (using do block to avoid errors if they exist, or just drop and recreate)
drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);

drop policy if exists "Users can insert their own profile." on profiles;
create policy "Users can insert their own profile." on profiles for insert with check ((select auth.uid()) = id);

drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile." on profiles for update using ((select auth.uid()) = id);
