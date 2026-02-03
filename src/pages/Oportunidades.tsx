import { useState, useMemo } from "react";
import { Search, Filter, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { licitaciones, formatCurrency, formatDate, LicitacionStatus } from "@/data/licitaciones";

export default function Oportunidades() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LicitacionStatus | "Todas">("Todas");

  const filteredLicitaciones = useMemo(() => {
    return licitaciones.filter((licitacion) => {
      const matchesSearch = 
        licitacion.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        licitacion.organismo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        licitacion.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "Todas" || licitacion.estado === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
          Oportunidades
        </h1>
        <p className="mt-2 text-muted-foreground">
          Explora licitaciones activas en Mercado Público
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in" style={{ animationDelay: "100ms" }}>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID, título u organismo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border focus:border-primary focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LicitacionStatus | "Todas")}>
            <SelectTrigger className="w-40 bg-card border-border">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas">Todas</SelectItem>
              <SelectItem value="Abierta">Abierta</SelectItem>
              <SelectItem value="Por Cerrar">Por Cerrar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "150ms" }}>
        {filteredLicitaciones.length} oportunidades encontradas
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden animate-fade-in" style={{ animationDelay: "200ms" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ID Licitación</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Título</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Organismo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Monto Estimado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Fecha de Cierre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLicitaciones.map((licitacion, index) => (
                <tr 
                  key={licitacion.id} 
                  className="group transition-colors hover:bg-muted/20 animate-fade-in"
                  style={{ animationDelay: `${250 + index * 30}ms` }}
                >
                  <td className="px-4 py-4">
                    <span className="text-sm font-mono text-primary">{licitacion.id}</span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-foreground line-clamp-2 max-w-xs">
                      {licitacion.titulo}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{licitacion.categoria}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground max-w-[200px] truncate">
                    {licitacion.organismo}
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(licitacion.montoEstimado)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(licitacion.fechaCierre)}
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={licitacion.estado === "Abierta" ? "open" : "closing"}>
                      {licitacion.estado}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-primary hover:text-primary hover:bg-primary/10"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLicitaciones.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-foreground">No se encontraron resultados</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
