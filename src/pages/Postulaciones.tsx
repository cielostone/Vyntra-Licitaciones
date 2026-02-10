import { FolderOpen, Clock, CheckCircle2, XCircle, FileEdit, ArrowRight, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useVyntra } from "@/context/VyntraContext";
import { Link } from "react-router-dom";
import { licitaciones, formatDate } from "@/data/licitaciones";

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
  const { drafts, favorites } = useVyntra();

  const favoriteLicitaciones = licitaciones.filter(l => favorites.includes(l.id));

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
          Gestión de Postulaciones
        </h1>
        <p className="mt-2 text-muted-foreground">
          Seguimiento de tus postulaciones activas, borradores y oportunidades guardadas
        </p>
      </div>

      <Tabs defaultValue="activas" className="w-full">
        <TabsList className="mb-8 w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
          <TabsTrigger
            value="activas"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
          >
            Activas
          </TabsTrigger>
          <TabsTrigger
            value="borradores"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
          >
            Borradores ({drafts.length})
          </TabsTrigger>
          <TabsTrigger
            value="favoritos"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
          >
            Favoritos ({favoriteLicitaciones.length})
          </TabsTrigger>
          <TabsTrigger
            value="historial"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
          >
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activas" className="animate-fade-in mt-0">
          <div className="grid gap-4">
            {postulaciones.map((postulacion, index) => (
              <div
                key={postulacion.id}
                className="group rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
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
              <p className="text-lg font-medium text-foreground">Sin postulaciones activas</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="borradores" className="animate-fade-in mt-0">
          <div className="grid gap-4">
            {drafts.map((draft, index) => (
              <div
                key={draft.id}
                className="group rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-primary">{draft.id}</span>
                      <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
                        <FileEdit className="h-3 w-3 mr-1" /> Borrador
                      </Badge>
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-1">
                      Propuesta en progreso
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Última edición: {new Date(draft.lastUpdated).toLocaleString('es-CL')}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Link to={`/postular/${draft.id}`}>
                      <Button className="gap-2">
                        Continuar <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {drafts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in border border-dashed rounded-xl">
              <FileEdit className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-foreground">No tienes borradores guardados</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tus propuestas guardadas aparecerán aquí
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="favoritos" className="animate-fade-in mt-0">
          <div className="grid gap-4">
            {favoriteLicitaciones.map((licitacion, index) => (
              <div
                key={licitacion.id}
                className="group rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-primary">{licitacion.id}</span>
                      <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
                        <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-500" /> Favorito
                      </Badge>
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-1">
                      {licitacion.titulo}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {licitacion.organismo} • Cierre: {formatDate(licitacion.fechaCierre)}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Link to={`/postular/${licitacion.id}`}>
                      <Button className="gap-2" variant="default">
                        Iniciar Postulación <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {favoriteLicitaciones.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in border border-dashed rounded-xl">
              <Star className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-foreground">No tienes licitaciones favoritas</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Marca licitaciones con la estrella en Oportunidades
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="historial" className="animate-fade-in mt-0">
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in border border-dashed rounded-xl">
            <Clock className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-foreground">Historial vacío</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Aquí verás tus postulaciones pasadas
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
