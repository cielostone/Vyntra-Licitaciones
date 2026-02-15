-- Create table for licitaciones
create table if not exists licitaciones (
  id text primary key, -- Using the LP-XXXX code as ID
  titulo text not null,
  organismo text not null,
  monto_estimado numeric not null,
  fecha_cierre date not null,
  estado text check (estado in ('Abierta', 'Por Cerrar', 'Cerrada', 'Adjudicada')),
  categoria text not null,
  fecha_adjudicacion date,
  description text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table licitaciones enable row level security;

-- Policies
create policy "Public licitaciones are viewable by everyone." on licitaciones for select using (true);
-- Only admins can insert/update (for now, maybe no one or via backend script)

-- Seed Data (from current mock)
insert into licitaciones (id, titulo, organismo, monto_estimado, fecha_cierre, estado, categoria, description, fecha_adjudicacion)
values
  ('LP-2024-001523', 'Servicio de mantención de infraestructura tecnológica', 'Ministerio de Salud', 45000000, '2024-02-15', 'Abierta', 'Tecnología', 'Servicio integral de mantenimiento preventivo y correctivo para servidores y redes de datos.', null),
  ('LP-2024-001456', 'Adquisición de equipamiento médico para hospitales regionales', 'Hospital Barros Luco', 120000000, '2024-02-10', 'Por Cerrar', 'Equipamiento Médico', 'Compra de equipos de rayos X y resonancia magnética.', null),
  ('LP-2024-001589', 'Consultoría en transformación digital institucional', 'Servicio de Impuestos Internos', 78000000, '2024-02-20', 'Abierta', 'Consultoría', 'Asesoría para la implementación de procesos digitales y cero papel.', null),
  ('LP-2024-001234', 'Provisión de servicios de seguridad y vigilancia', 'Municipalidad de Santiago', 35000000, '2024-02-08', 'Por Cerrar', 'Servicios', 'Servicio de guardias de seguridad 24/7 para recintos municipales.', null),
  ('LP-2024-001678', 'Desarrollo de plataforma de gestión documental', 'Contraloría General de la República', 95000000, '2024-02-25', 'Abierta', 'Tecnología', 'Sistema web para la gestión de documentos electrónicos con firma digital avanzada.', null),
  ('LP-2024-001345', 'Suministro de insumos de oficina y escritorio', 'Ministerio de Educación', 12000000, '2024-02-12', 'Adjudicada', 'Suministros', 'Compra de papel, lápices, carpetas y otros artículos de oficina.', '2024-01-25'),
  ('LP-2024-001789', 'Servicio de capacitación en ciberseguridad', 'Banco Central de Chile', 28000000, '2024-02-28', 'Abierta', 'Capacitación', 'Curso de capacitación para funcionarios en técnicas de prevención de phishing y malware.', null),
  ('LP-2024-001890', 'Arriendo de vehículos para operaciones de fiscalización', 'Superintendencia de Medio Ambiente', 42000000, '2024-03-05', 'Abierta', 'Transporte', 'Arriendo de camionetas 4x4 para terreno.', null),
  ('LP-2024-001123', 'Mantenimiento de sistemas HVAC en edificio central', 'Tesorería General de la República', 18000000, '2024-02-09', 'Adjudicada', 'Mantención', 'Mantención preventiva de equipos de aire acondicionado.', '2024-01-15'),
  ('LP-2024-001567', 'Implementación de sistema de gestión de recursos humanos', 'Dirección del Trabajo', 156000000, '2024-03-10', 'Abierta', 'Tecnología', 'Software ERP para la gestión de nómina y asistencia.', null)
on conflict (id) do nothing;
