export type LicitacionStatus = "Abierta" | "Por Cerrar" | "Cerrada" | "Adjudicada";

export interface Licitacion {
  id: string;
  titulo: string;
  organismo: string;
  montoEstimado: number;
  fechaCierre: string;
  estado: LicitacionStatus;
  categoria: string;
  fechaAdjudicacion?: string; // Para análisis de flujo por mes
  description?: string; // Para análisis de keywords
}

export const licitaciones: Licitacion[] = [
  {
    id: "LP-2024-001523",
    titulo: "Servicio de mantención de infraestructura tecnológica",
    organismo: "Ministerio de Salud",
    montoEstimado: 45000000,
    fechaCierre: "2024-02-15",
    estado: "Abierta",
    categoria: "Tecnología",
    description: "Servicio integral de mantenimiento preventivo y correctivo para servidores y redes de datos."
  },
  {
    id: "LP-2024-001456",
    titulo: "Adquisición de equipamiento médico para hospitales regionales",
    organismo: "Hospital Barros Luco",
    montoEstimado: 120000000,
    fechaCierre: "2024-02-10",
    estado: "Por Cerrar",
    categoria: "Equipamiento Médico",
    description: "Compra de equipos de rayos X y resonancia magnética."
  },
  {
    id: "LP-2024-001589",
    titulo: "Consultoría en transformación digital institucional",
    organismo: "Servicio de Impuestos Internos",
    montoEstimado: 78000000,
    fechaCierre: "2024-02-20",
    estado: "Abierta",
    categoria: "Consultoría",
    description: "Asesoría para la implementación de procesos digitales y cero papel."
  },
  {
    id: "LP-2024-001234",
    titulo: "Provisión de servicios de seguridad y vigilancia",
    organismo: "Municipalidad de Santiago",
    montoEstimado: 35000000,
    fechaCierre: "2024-02-08",
    estado: "Por Cerrar",
    categoria: "Servicios",
    description: "Servicio de guardias de seguridad 24/7 para recintos municipales."
  },
  {
    id: "LP-2024-001678",
    titulo: "Desarrollo de plataforma de gestión documental",
    organismo: "Contraloría General de la República",
    montoEstimado: 95000000,
    fechaCierre: "2024-02-25",
    estado: "Abierta",
    categoria: "Tecnología",
    description: "Sistema web para la gestión de documentos electrónicos con firma digital avanzada."
  },
  {
    id: "LP-2024-001345",
    titulo: "Suministro de insumos de oficina y escritorio",
    organismo: "Ministerio de Educación",
    montoEstimado: 12000000,
    fechaCierre: "2024-02-12",
    estado: "Adjudicada",
    categoria: "Suministros",
    fechaAdjudicacion: "2024-01-25",
    description: "Compra de papel, lápices, carpetas y otros artículos de oficina."
  },
  {
    id: "LP-2024-001789",
    titulo: "Servicio de capacitación en ciberseguridad",
    organismo: "Banco Central de Chile",
    montoEstimado: 28000000,
    fechaCierre: "2024-02-28",
    estado: "Abierta",
    categoria: "Capacitación",
    description: "Curso de capacitación para funcionarios en técnicas de prevención de phishing y malware."
  },
  {
    id: "LP-2024-001890",
    titulo: "Arriendo de vehículos para operaciones de fiscalización",
    organismo: "Superintendencia de Medio Ambiente",
    montoEstimado: 42000000,
    fechaCierre: "2024-03-05",
    estado: "Abierta",
    categoria: "Transporte",
    description: "Arriendo de camionetas 4x4 para terreno."
  },
  {
    id: "LP-2024-001123",
    titulo: "Mantenimiento de sistemas HVAC en edificio central",
    organismo: "Tesorería General de la República",
    montoEstimado: 18000000,
    fechaCierre: "2024-02-09",
    estado: "Adjudicada",
    categoria: "Mantención",
    fechaAdjudicacion: "2024-01-15",
    description: "Mantención preventiva de equipos de aire acondicionado."
  },
  {
    id: "LP-2024-001567",
    titulo: "Implementación de sistema de gestión de recursos humanos",
    organismo: "Dirección del Trabajo",
    montoEstimado: 156000000,
    fechaCierre: "2024-03-10",
    estado: "Abierta",
    categoria: "Tecnología",
    description: "Software ERP para la gestión de nómina y asistencia."
  }
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const calculateTax = (amount: number): number => {
  return amount * 0.19;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};
