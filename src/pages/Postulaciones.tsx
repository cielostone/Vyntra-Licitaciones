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
    <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto">
      <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-2">
        <h1 className="text-3xl font-extrabold text-foreground md:text-4xl tracking-tight">
          Gestión de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">Postulaciones</span>
        </h1>
        <p className="text-lg font-medium text-muted-foreground mt-2 max-w-2xl">
          Seguimiento de tus operaciones activas, borradores y radar de favoritos
        </p>
      </div>

      <Tabs defaultValue="activas" className="w-full">
        <TabsList className="mb-8 w-full justify-start border-b border-white/5 disabled:border-slate-200 rounded-none h-auto p-0 bg-transparent gap-8">
          <TabsTrigger
            value="activas"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-500 dark:data-[state=active]:text-indigo-400 data-[state=active]:bg-transparent px-2 py-3 font-bold text-base transition-all text-slate-500"
          >
            Activas
          </TabsTrigger>
          <TabsTrigger
            value="borradores"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-500 dark:data-[state=active]:text-indigo-400 data-[state=active]:bg-transparent px-2 py-3 font-bold text-base transition-all text-slate-500 flex items-center gap-2"
          >
            Borradores
            <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-none px-1.5 py-0 rounded-md">
              {drafts.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="favoritos"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-500 dark:data-[state=active]:text-indigo-400 data-[state=active]:bg-transparent px-2 py-3 font-bold text-base transition-all text-slate-500 flex items-center gap-2"
          >
            Favoritos
            <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-none px-1.5 py-0 rounded-md">
              {favoriteLicitaciones.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="historial"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-500 dark:data-[state=active]:text-indigo-400 data-[state=active]:bg-transparent px-2 py-3 font-bold text-base transition-all text-slate-500"
          >
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activas" className="mt-0 outline-none">
          <div className="grid gap-4">
            {postulaciones.map((postulacion, index) => (
              <div
                key={postulacion.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-card/40 backdrop-blur-xl p-6 transition-all duration-300 hover:border-indigo-500/30 hover:shadow-xl animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between relative z-10">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md">{postulacion.id}</span>
                      <Badge variant={getStatusVariant(postulacion.estado) as any} className="font-bold border-none capitalize px-3 py-1 gap-1.5 shadow-sm">
                        {getStatusIcon(postulacion.estado)}
                        {postulacion.estado}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-foreground leading-tight tracking-tight group-hover:text-indigo-500 transition-colors">
                      {postulacion.titulo}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                       {postulacion.organismo}
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-slate-400 bg-slate-100 dark:bg-white/5 py-1.5 px-3 rounded-lg border border-slate-200 dark:border-white/10 whitespace-nowrap">
                    Postulado: {new Date(postulacion.fechaPostulacion).toLocaleDateString('es-CL')}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {postulaciones.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-in zoom-in-95 duration-500 border border-dashed border-slate-200 dark:border-white/10 rounded-3xl bg-white/30 dark:bg-card/20 backdrop-blur-sm">
              <FolderOpen className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-6 drop-shadow-sm" />
              <p className="text-xl font-bold text-foreground">Sin postulaciones activas</p>
              <p className="mt-2 text-base font-medium text-muted-foreground w-2/3 mx-auto">
                No tienes operaciones en curso. Visita la pestaña de Oportunidades para empezar.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="borradores" className="mt-0 outline-none">
          <div className="grid gap-4">
            {drafts.map((draft, index) => (
              <div
                key={draft.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-card/40 backdrop-blur-xl p-6 transition-all duration-300 hover:border-indigo-500/30 hover:shadow-xl animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between relative z-10">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md">{draft.id}</span>
                      <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-none bg-amber-500/10 font-bold px-3 py-1 gap-1.5 shadow-sm">
                        <FileEdit className="h-3.5 w-3.5" /> Borrador en Pausa
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground leading-tight tracking-tight">
                        Propuesta en progreso
                      </h3>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> Última edición: {new Date(draft.lastUpdated).toLocaleString('es-CL')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Link to={`/postular/${draft.id}`}>
                      <Button className="gap-2 bg-foreground text-background font-bold hover:bg-foreground/90 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto shadow-md">
                        Retomar Postulación <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {drafts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-in zoom-in-95 duration-500 border border-dashed border-slate-200 dark:border-white/10 rounded-3xl bg-white/30 dark:bg-card/20 backdrop-blur-sm">
              <FileEdit className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-6 drop-shadow-sm" />
              <p className="text-xl font-bold text-foreground">No tienes borradores guardados</p>
              <p className="mt-2 text-base font-medium text-muted-foreground w-2/3 mx-auto">
                Las propuestas que empieces a redactar y dejes sin enviar se sincronizarán aquí automáticamente.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="favoritos" className="mt-0 outline-none">
          <div className="grid gap-4">
            {favoriteLicitaciones.map((licitacion, index) => (
              <div
                key={licitacion.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-card/40 backdrop-blur-xl p-6 transition-all duration-300 hover:border-amber-500/30 hover:shadow-xl hover:shadow-amber-500/5 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between relative z-10">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md">{licitacion.id}</span>
                      <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-none bg-amber-500/10 font-bold px-3 py-1 gap-1.5 shadow-sm">
                        <Star className="h-3.5 w-3.5 fill-amber-400" /> Preferido
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-foreground leading-tight tracking-tight max-w-2xl line-clamp-2">
                      {licitacion.titulo}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span className="truncate max-w-[200px]">{licitacion.organismo}</span> 
                      <span>•</span>
                      <span className="font-semibold text-foreground bg-slate-100 dark:bg-white/5 py-1 px-2 rounded-md border border-slate-200 dark:border-white/10">Clausura: {formatDate(licitacion.fechaCierre)}</span>
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Link to={`/postular/${licitacion.id}`}>
                      <Button className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold w-full sm:w-auto shadow-md shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 border-none">
                        Iniciar Oferta <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {favoriteLicitaciones.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-in zoom-in-95 duration-500 border border-dashed border-slate-200 dark:border-white/10 rounded-3xl bg-white/30 dark:bg-card/20 backdrop-blur-sm">
              <Star className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-6 drop-shadow-sm" />
              <p className="text-xl font-bold text-foreground">Radar estático</p>
              <p className="mt-2 text-base font-medium text-muted-foreground w-2/3 mx-auto">
                Marca licitaciones usando la estrella en Oportunidades para guardarlas y darles seguimiento.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="historial" className="mt-0 outline-none">
          <div className="flex flex-col items-center justify-center py-24 text-center animate-in zoom-in-95 duration-500 border border-dashed border-slate-200 dark:border-white/10 rounded-3xl bg-white/30 dark:bg-card/20 backdrop-blur-sm">
            <Clock className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-6 drop-shadow-sm" />
            <p className="text-xl font-bold text-foreground">Aún no hay registros de actividades</p>
            <p className="mt-2 text-base font-medium text-muted-foreground w-2/3 mx-auto">
              Cuando adjudiques, pierdas, o se completen licitaciones, se archivarán en esta sección permanentemente.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
