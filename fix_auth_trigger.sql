-- ============================================================
-- FIX: Corrige el trigger handle_new_user
-- Ejecutar COMPLETO en: Supabase → SQL Editor → New query → Run
-- ============================================================

-- 1. Eliminar trigger anterior
drop trigger if exists on_auth_user_created on auth.users;

-- 2. Reemplazar función con versión robusta
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    case
      when coalesce(new.raw_user_meta_data->>'full_name', '') = '' then new.email
      when char_length(coalesce(new.raw_user_meta_data->>'full_name', '')) < 2 then new.email
      else new.raw_user_meta_data->>'full_name'
    end
  )
  on conflict (id) do nothing;
  return new;
exception
  when others then
    raise warning 'handle_new_user failed for user %: %', new.id, sqlerrm;
    return new;
end;
$$ language plpgsql security definer set search_path = public;

-- 3. Recrear el trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 4. Flexibilizar el check de full_name (acepta null o >= 2 chars)
alter table public.profiles
  drop constraint if exists profiles_full_name_check;

alter table public.profiles
  add constraint profiles_full_name_check
  check (full_name is null or char_length(full_name) >= 2);
