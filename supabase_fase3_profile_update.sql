-- Fase 3.1: Actualización del Perfil de Usuario con Fotografía y Metadatos

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS nickname TEXT,
ADD COLUMN IF NOT EXISTS age TEXT;
