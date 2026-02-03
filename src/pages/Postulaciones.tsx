import { FolderOpen, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const postulaciones = [
  {
    id: "LP-2024-001456",
    titulo: "Adquisición de equipamiento médico para hospitales regionales",
    organismo: "Hospital Barros Luco",
    fechaPostulacion: "2024-01-28",
    estado: "En Revisión"
  },
  {
    id: "LP-2024-001234",
    titulo: "Provisión de servicios de seguridad y vigilancia",
    organismo: "Municipalidad de Santiago",
    fechaPostulacion: "2024-01-25",
    estado: "Enviada"
  },
  {
    id: "LP-2024-000987",
    titulo: "Desarrollo de sistema de gestión integrado",
    organismo: "Ministerio de Hacienda",
    fechaPostulacion: "2024-01-15",
    estado: "Aprobada"
  }
];

const getStatusIcon = (estado: string) => {
  switch (estado) {
    case "En Revisión":
      return <Clock className="h-4 w-4" />;
    case "Enviada":
      return <FolderOpen className="h-4 w-4" />;
    case "Aprobada":
      return <CheckCircle2 className="h-4 w-4" />;
    case "Rechazada":
      return <XCircle className="h-4 w-4" />;
    default:
      return <FolderOpen className="h-4 w-4" />;
  }
};

const getStatusVariant = (estado: string) => {
  switch (estado) {
    case "Aprobada":
      return "open";
    case "En Revisión":
      return "warning";
    case "Rechazada":
      return "destructive";
    default:
      return "secondary";
  }
};

export default function Postulaciones() {
  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
          Mis Postulaciones
        </h1>
        <p className="mt-2 text-muted-foreground">
          Seguimiento de tus postulaciones activas
        </p>
      </div>

      <div className="grid gap-4 animate-fade-in" style={{ animationDelay: "100ms" }}>
        {postulaciones.map((postulacion, index) => (
          <div 
            key={postulacion.id}
            className="group rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg animate-fade-in"
            style={{ animationDelay: `${150 + index * 50}ms` }}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-mono text-primary">{postulacion.id}</span>
                  <Badge variant={getStatusVariant(postulacion.estado) as any}>
                    {getStatusIcon(postulacion.estado)}
                    <span className="ml-1">{postulacion.estado}</span>
                  </Badge>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">
                  {postulacion.titulo}
                </h3>
                <p className="text-sm text-muted-foreground">{postulacion.organismo}</p>
              </div>
              <div className="text-sm text-muted-foreground">
                Postulado: {new Date(postulacion.fechaPostulacion).toLocaleDateString('es-CL')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {postulaciones.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
          <FolderOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-foreground">Sin postulaciones</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Explora las oportunidades disponibles para comenzar
          </p>
        </div>
      )}
    </div>
  );
}
