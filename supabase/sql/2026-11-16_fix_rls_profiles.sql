-- Arregla "infinite recursion detected in policy for relation profiles"
-- y crea la organización de usuarios que quedaron sin una.
-- Ejecutar una vez en Supabase → SQL Editor.

-- 1) Organización del usuario actual, leída sin pasar por RLS (evita la recursión)
create or replace function public.my_organization_id()
returns uuid language sql stable security definer set search_path = public
as $$ select organization_id from public.profiles where id = auth.uid() $$;

-- 2) Política de lectura de profiles sin recursión
drop policy if exists profiles_select_own_org on public.profiles;
create policy profiles_select_own_org on public.profiles for select
  using (id = auth.uid() or organization_id = public.my_organization_id());

-- 3) Desde el navegador nadie puede cambiarse de organización ni de rol
revoke insert, update on public.profiles from authenticated, anon;
grant insert (id, email, full_name, rut, person_type, company_name, company_rut, phone, avatar_url)
  on public.profiles to authenticated;
grant update (email, full_name, rut, person_type, company_name, company_rut, phone, avatar_url)
  on public.profiles to authenticated;

-- 4) Crea la organización del usuario si no tiene y lo deja como owner
create or replace function public.ensure_my_organization()
returns uuid language plpgsql security definer set search_path = public
as $$
declare
  v_org uuid;
  v_name text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;

  select organization_id, coalesce(nullif(company_name, ''), nullif(full_name, ''), email, 'Mi empresa')
    into v_org, v_name
    from profiles where id = auth.uid() for update;
  if not found then raise exception 'profile not found'; end if;
  if v_org is not null then return v_org; end if;

  insert into organizations (name, plan, max_users) values (v_name, 'free', 1)
    returning id into v_org;
  update profiles set organization_id = v_org, role = 'owner' where id = auth.uid();
  return v_org;
end $$;

revoke execute on function public.ensure_my_organization() from public, anon;
grant execute on function public.ensure_my_organization() to authenticated;
