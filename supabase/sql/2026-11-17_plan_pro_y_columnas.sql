-- Columnas que la app usa y faltaban, plan controlado por el servidor
-- y cuenta de Vyntra en PRO. Ejecutar una vez en Supabase → SQL Editor.

-- 1) Columnas usadas por Configuración y el PDF
alter table public.organizations
  add column if not exists logo_url text,
  add column if not exists firma_url text;

alter table public.profiles
  add column if not exists nickname text,
  add column if not exists age text,
  add column if not exists whatsapp_number text,
  add column if not exists alerts_whatsapp boolean not null default false,
  add column if not exists alerts_email boolean not null default false;

-- 2) El usuario edita sus datos, pero no su organización, rol ni plan
grant update (nickname, age, whatsapp_number, alerts_whatsapp, alerts_email)
  on public.profiles to authenticated;

revoke update on public.organizations from authenticated, anon;
grant update (name, rut, logo_url, firma_url) on public.organizations to authenticated;

-- 3) Cuenta de Vyntra en plan PRO
update public.organizations set plan = 'pro'
where id = (select organization_id from public.profiles where email = 'vyntrachile@gmail.com');

select o.name, o.plan from public.organizations o
join public.profiles p on p.organization_id = o.id
where p.email = 'vyntrachile@gmail.com';
