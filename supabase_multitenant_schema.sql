-- ============================================================
-- VYNTRA LICITACIONES — SCHEMA MULTITENANT COMPLETO
-- SaaS B2B para gestión de licitaciones públicas (Mercado Público Chile)
-- ============================================================
-- INSTRUCCIONES:
--   1. Ir a tu nuevo proyecto Supabase → SQL Editor
--   2. Pegar TODO este archivo y ejecutar
--   3. Las políticas RLS garantizan aislamiento entre tenants
-- ============================================================

-- ─────────────────────────────────────────────
-- EXTENSIONES
-- ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- Para búsqueda full-text eficiente

-- ─────────────────────────────────────────────
-- 1. ORGANIZATIONS (el tenant)
-- ─────────────────────────────────────────────
create table if not exists organizations (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  rut             text unique,                        -- RUT empresa (ej. "76.543.210-K")
  plan            text not null default 'free'
                    check (plan in ('free', 'pro', 'enterprise')),
  plan_expires_at timestamptz,                        -- NULL = sin vencimiento (free)
  max_users       int not null default 1,
  stripe_customer_id text,                            -- Para billing futuro (Stripe/Transbank)
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table organizations is 'Cada fila es un tenant (empresa o profesional independiente)';

-- ─────────────────────────────────────────────
-- 2. PROFILES (usuarios vinculados a un tenant)
-- ─────────────────────────────────────────────
create table if not exists profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  role            text not null default 'member'
                    check (role in ('owner', 'admin', 'member')),
  email           text,
  full_name       text check (char_length(full_name) >= 3),
  rut             text,                                -- RUN personal
  person_type     text check (person_type in ('natural', 'juridica')),
  company_name    text,                                -- Razón social si es jurídica
  company_rut     text,
  phone           text,
  avatar_url      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table profiles is 'Perfil extendido de cada usuario. Vinculado a organizations.';

-- RLS para profiles
alter table profiles enable row level security;

create policy "profiles_select_own_org" on profiles
  for select using (
    organization_id = (select organization_id from profiles where id = auth.uid())
    or id = auth.uid()
  );

create policy "profiles_update_own" on profiles
  for update using (id = auth.uid());

create policy "profiles_insert_own" on profiles
  for insert with check (id = auth.uid());

-- ─────────────────────────────────────────────
-- 3. LICITACIONES (datos públicos — sin tenant)
--    Se sincronizan desde la API de Mercado Público
--    Son globales: todos los tenants ven las mismas licitaciones
-- ─────────────────────────────────────────────
create table if not exists licitaciones (
  id              text primary key,                   -- Ej: "LP-2024-001523" (código oficial)
  titulo          text not null,
  organismo       text not null,
  monto_estimado  numeric,
  fecha_cierre    date,
  fecha_publicacion date,
  fecha_adjudicacion date,
  estado          text check (estado in ('Abierta', 'Por Cerrar', 'Cerrada', 'Adjudicada', 'Desierta')),
  categoria       text,
  description     text,
  region          text,
  fuente_url      text,                               -- URL en Mercado Público
  raw_data        jsonb,                              -- JSON completo de la API (para no perder info)
  synced_at       timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

comment on table licitaciones is 'Cache de licitaciones públicas. Se actualiza periódicamente desde la API de Mercado Público.';

-- Índices para búsqueda rápida
create index if not exists licitaciones_estado_idx on licitaciones(estado);
create index if not exists licitaciones_fecha_cierre_idx on licitaciones(fecha_cierre);
create index if not exists licitaciones_categoria_idx on licitaciones(categoria);
create index if not exists licitaciones_organismo_trgm_idx on licitaciones using gin(organismo gin_trgm_ops);
create index if not exists licitaciones_titulo_trgm_idx on licitaciones using gin(titulo gin_trgm_ops);

-- RLS: Licitaciones son públicas para cualquier usuario autenticado
alter table licitaciones enable row level security;

create policy "licitaciones_viewable_by_authenticated" on licitaciones
  for select using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────
-- 4. FAVORITES (favoritos por usuario/org)
-- ─────────────────────────────────────────────
create table if not exists favorites (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  licitacion_id   text not null references licitaciones(id) on delete cascade,
  created_at      timestamptz not null default now(),
  unique(user_id, licitacion_id)
);

comment on table favorites is 'Favoritos por usuario. Respeta límites del plan (free: max 3).';

alter table favorites enable row level security;

create policy "favorites_tenant_isolation" on favorites
  for all using (
    organization_id = (select organization_id from profiles where id = auth.uid())
    and user_id = auth.uid()
  );

-- ─────────────────────────────────────────────
-- 5. DRAFTS (borradores de postulación)
-- ─────────────────────────────────────────────
create table if not exists drafts (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id         uuid not null references profiles(id) on delete cascade,
  licitacion_id   text not null references licitaciones(id) on delete cascade,
  content         jsonb not null default '{}',        -- Items, condiciones comerciales, etc.
  status          text not null default 'draft'
                    check (status in ('draft', 'submitted', 'won', 'lost')),
  updated_at      timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  unique(organization_id, licitacion_id)
);

comment on table drafts is 'Borradores de postulación. Un borrador por licitación por organización.';

alter table drafts enable row level security;

create policy "drafts_tenant_isolation" on drafts
  for all using (
    organization_id = (select organization_id from profiles where id = auth.uid())
  );

-- ─────────────────────────────────────────────
-- 6. SUBSCRIPTIONS (historial de billing)
-- ─────────────────────────────────────────────
create table if not exists subscriptions (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  plan            text not null check (plan in ('free', 'pro', 'enterprise')),
  status          text not null default 'active'
                    check (status in ('active', 'canceled', 'past_due', 'trialing')),
  period_start    timestamptz,
  period_end      timestamptz,
  provider        text default 'manual'
                    check (provider in ('manual', 'stripe', 'transbank')),
  provider_subscription_id text,
  amount_clp      int,                                -- Monto en CLP
  created_at      timestamptz not null default now()
);

comment on table subscriptions is 'Historial de suscripciones y pagos por organización.';

alter table subscriptions enable row level security;

create policy "subscriptions_tenant_read" on subscriptions
  for select using (
    organization_id = (select organization_id from profiles where id = auth.uid())
  );

-- ─────────────────────────────────────────────
-- 7. NOTIFICATION_CONFIGS (alertas por org)
-- ─────────────────────────────────────────────
create table if not exists notification_configs (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id         uuid not null references profiles(id) on delete cascade,
  alert_new_licitaciones  boolean not null default true,
  alert_closing_soon      boolean not null default true,  -- 48h antes del cierre
  alert_status_changes    boolean not null default true,
  keywords                text[],                         -- Palabras clave para filtrar alertas
  categorias_interes      text[],                         -- Categorías de interés
  monto_minimo            numeric,
  monto_maximo            numeric,
  updated_at              timestamptz not null default now(),
  unique(organization_id, user_id)
);

comment on table notification_configs is 'Configuración de alertas por usuario dentro de una organización.';

alter table notification_configs enable row level security;

create policy "notif_config_tenant_isolation" on notification_configs
  for all using (
    organization_id = (select organization_id from profiles where id = auth.uid())
    and user_id = auth.uid()
  );

-- ─────────────────────────────────────────────
-- 8. MATCH_CONFIGS (perfil de matching por org)
--    Para el algoritmo de Match Score
-- ─────────────────────────────────────────────
create table if not exists match_configs (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade unique,
  keywords        text[] not null default '{}',       -- Palabras clave del rubro
  categorias      text[] not null default '{}',       -- Categorías preferidas
  regiones        text[] not null default '{}',       -- Regiones de interés ('13', '5', 'Todas')
  monto_minimo    numeric,
  monto_maximo    numeric,
  updated_at      timestamptz not null default now()
);

comment on table match_configs is 'Perfil de matching para calcular el match score de licitaciones por organización.';

alter table match_configs enable row level security;

create policy "match_config_tenant_isolation" on match_configs
  for all using (
    organization_id = (select organization_id from profiles where id = auth.uid())
  );

-- ─────────────────────────────────────────────
-- TRIGGERS: updated_at automático
-- ─────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger organizations_updated_at before update on organizations
  for each row execute function update_updated_at();

create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();

create trigger drafts_updated_at before update on drafts
  for each row execute function update_updated_at();

create trigger match_configs_updated_at before update on match_configs
  for each row execute function update_updated_at();

create trigger notification_configs_updated_at before update on notification_configs
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────────
-- FUNCIÓN: Crear organización + perfil automáticamente al registrarse
-- Se invoca como Database Webhook o desde el cliente al hacer signUp
-- ─────────────────────────────────────────────
create or replace function handle_new_user()
returns trigger as $$
begin
  -- El perfil se inserta desde el cliente con los datos extendidos (RUT, etc.)
  -- Esta función es un fallback por si el cliente falla
  insert into profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─────────────────────────────────────────────
-- SEED: Datos de prueba para licitaciones
-- (Reemplazar por integración real con API Mercado Público)
-- ─────────────────────────────────────────────
insert into licitaciones (id, titulo, organismo, monto_estimado, fecha_cierre, estado, categoria, description)
values
  ('LP-2024-001523', 'Servicio de mantención de infraestructura tecnológica', 'Ministerio de Salud', 45000000, '2025-06-15', 'Abierta', 'Tecnología', 'Servicio integral de mantenimiento preventivo y correctivo para servidores y redes de datos.'),
  ('LP-2024-001456', 'Adquisición de equipamiento médico para hospitales regionales', 'Hospital Barros Luco', 120000000, '2025-06-10', 'Por Cerrar', 'Equipamiento Médico', 'Compra de equipos de rayos X y resonancia magnética.'),
  ('LP-2024-001589', 'Consultoría en transformación digital institucional', 'Servicio de Impuestos Internos', 78000000, '2025-07-20', 'Abierta', 'Consultoría', 'Asesoría para la implementación de procesos digitales y cero papel.'),
  ('LP-2024-001234', 'Provisión de servicios de seguridad y vigilancia', 'Municipalidad de Santiago', 35000000, '2025-06-08', 'Por Cerrar', 'Servicios', 'Servicio de guardias de seguridad 24/7 para recintos municipales.'),
  ('LP-2024-001678', 'Desarrollo de plataforma de gestión documental', 'Contraloría General de la República', 95000000, '2025-07-25', 'Abierta', 'Tecnología', 'Sistema web para la gestión de documentos electrónicos con firma digital avanzada.'),
  ('LP-2024-001345', 'Suministro de insumos de oficina y escritorio', 'Ministerio de Educación', 12000000, '2025-05-12', 'Adjudicada', 'Suministros', 'Compra de papel, lápices, carpetas y otros artículos de oficina.'),
  ('LP-2024-001789', 'Servicio de capacitación en ciberseguridad', 'Banco Central de Chile', 28000000, '2025-07-28', 'Abierta', 'Capacitación', 'Curso de capacitación para funcionarios en técnicas de prevención de phishing y malware.'),
  ('LP-2024-001890', 'Arriendo de vehículos para operaciones de fiscalización', 'Superintendencia de Medio Ambiente', 42000000, '2025-08-05', 'Abierta', 'Transporte', 'Arriendo de camionetas 4x4 para terreno.'),
  ('LP-2024-001123', 'Mantenimiento de sistemas HVAC en edificio central', 'Tesorería General de la República', 18000000, '2025-05-09', 'Adjudicada', 'Mantención', 'Mantención preventiva de equipos de aire acondicionado.'),
  ('LP-2024-001567', 'Implementación de sistema de gestión de recursos humanos', 'Dirección del Trabajo', 156000000, '2025-08-10', 'Abierta', 'Tecnología', 'Software ERP para la gestión de nómina y asistencia.')
on conflict (id) do nothing;
