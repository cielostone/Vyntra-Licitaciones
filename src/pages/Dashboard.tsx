import { FileText, FolderOpen, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { licitaciones, formatCurrency, formatDate } from "@/data/licitaciones";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const recentLicitaciones = licitaciones.slice(0, 5);
  const openCount = licitaciones.filter(l => l.estado === "Abierta").length;
  const closingCount = licitaciones.filter(l => l.estado === "Por Cerrar").length;
  const totalMonto = licitaciones.reduce((acc, l) => acc + l.montoEstimado, 0);

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
          Bienvenido a <span className="text-gradient">Vyntra Gov</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Resumen de oportunidades y actividad reciente
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-fade-in" style={{ animationDelay: "100ms" }}>
        <StatCard
          title="Oportunidades Abiertas"
          value={openCount}
          subtitle="Licitaciones activas"
          icon={FileText}
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          title="Por Cerrar"
          value={closingCount}
          subtitle="Próximos 7 días"
          icon={Clock}
        />
        <StatCard
          title="Mis Postulaciones"
          value={3}
          subtitle="En proceso"
          icon={FolderOpen}
        />
        <StatCard
          title="Monto Total Disponible"
          value={formatCurrency(totalMonto)}
          icon={TrendingUp}
        />
      </div>

      <div className="mt-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Oportunidades Recientes</h2>
          <Link to="/oportunidades">
            <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
              Ver todas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Título</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Organismo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Monto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Cierre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentLicitaciones.map((licitacion, index) => (
                  <tr 
                    key={licitacion.id} 
                    className="group transition-colors hover:bg-muted/20"
                    style={{ animationDelay: `${300 + index * 50}ms` }}
                  >
                    <td className="px-4 py-4 text-sm font-mono text-primary">{licitacion.id}</td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-foreground line-clamp-1 max-w-xs">
                        {licitacion.titulo}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{licitacion.organismo}</td>
                    <td className="px-4 py-4 text-sm font-medium text-foreground">{formatCurrency(licitacion.montoEstimado)}</td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{formatDate(licitacion.fechaCierre)}</td>
                    <td className="px-4 py-4">
                      <Badge variant={licitacion.estado === "Abierta" ? "open" : "closing"}>
                        {licitacion.estado}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
