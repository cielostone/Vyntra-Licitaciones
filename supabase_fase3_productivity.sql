-- Migration Fase 3: Productividad B2B (Tareas y Alarmas)

-- 1. Tabla de Tareas (Task Manager)
CREATE TABLE tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS para Tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver sus propias tareas"
    ON tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus tareas"
    ON tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus tareas"
    ON tasks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus tareas"
    ON tasks FOR DELETE
    USING (auth.uid() = user_id);

-- 2. Variables de Alarma en Perfiles (Profiles)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
ADD COLUMN IF NOT EXISTS alerts_whatsapp BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS alerts_email BOOLEAN DEFAULT false;
