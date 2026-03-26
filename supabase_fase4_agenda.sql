-- Fase 4: Expansión de Gestión Avanzada (Agenda Full)

-- Extender la tabla tasks para soportar notas enriquecidas y evidencia fotográfica
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Opcional: Asegurarse de que due_date soporte horas exactas
-- (Ya es TIMESTAMP WITH TIME ZONE, por lo que soporta fechas y horas de manera nativa).
