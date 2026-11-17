-- Color de las cotizaciones elegido por la empresa (Configuración → Identidad Comercial).
-- Logo y firma se guardan como imagen reducida (data URL) en logo_url / firma_url.
alter table public.organizations
  add column if not exists brand_color text
  check (brand_color is null or brand_color ~ '^#[0-9A-Fa-f]{6}$');

grant update (brand_color) on public.organizations to authenticated;
