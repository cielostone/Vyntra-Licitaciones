-- ==============================================================================
-- MIGRACIÓN VYNTRA FASE 2: PLANTILLAS Y COTIZACIONES
-- Ejecuta este script en el SQL Editor de Supabase para agregar las columnas necesarias
-- ==============================================================================

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS logo_url text,                               
ADD COLUMN IF NOT EXISTS firma_url text,                              
ADD COLUMN IF NOT EXISTS condiciones_default jsonb;

-- Crear un Storage Bucket público para almacenar las imágenes (logos y firmas)
insert into storage.buckets (id, name, public) 
values ('vyntra_assets', 'vyntra_assets', true)
on conflict (id) do nothing;

-- Políticas del bucket vyntra_assets
create policy "Assets son publicos" 
  on storage.objects for select 
  using ( bucket_id = 'vyntra_assets' );

create policy "Usuarios autenticados pueden subir assets" 
  on storage.objects for insert 
  with check ( bucket_id = 'vyntra_assets' and auth.role() = 'authenticated' );

create policy "Usuarios solo pueden borrar sus propios assets" 
  on storage.objects for delete 
  using ( bucket_id = 'vyntra_assets' and auth.role() = 'authenticated' );
