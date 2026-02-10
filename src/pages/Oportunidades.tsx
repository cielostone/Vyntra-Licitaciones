
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { Search, Filter, ExternalLink, Star, MoreHorizontal, FileDown, Eye, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { licitaciones, formatCurrency, formatDate, LicitacionStatus, Licitacion } from "@/data/licitaciones";
import { calculateMatchScore } from "@/lib/matching";
import { useVyntra } from "@/context/VyntraContext";

export default function Oportunidades() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LicitacionStatus | "Todas">("Todas");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const { favorites, toggleFavorite, subscriptionPlan } = useVyntra();
  const { toast } = useToast();

  const handleToggleFavorite = (id: string) => {
    const isFavorite = favorites.includes(id);

    if (!isFavorite && subscriptionPlan === 'free' && favorites.length >= 3) {
      toast({
        title: "Límite de Favoritos 🔒",
        description: "El plan gratuito permite hasta 3 favoritos. Actualiza a PRO para ilimitados.",
        variant: "destructive",
      });
      return;
    }

    toggleFavorite(id);
  };

  const filteredLicitaciones = useMemo(() => {
    return licitaciones.filter((licitacion) => {
      const matchesSearch =
        licitacion.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        licitacion.organismo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        licitacion.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "Todas" || licitacion.estado === statusFilter;
      const matchesFavorite = showFavoritesOnly ? favorites.includes(licitacion.id) : true;

      return matchesSearch && matchesStatus && matchesFavorite;
    });
  }, [searchQuery, statusFilter, showFavoritesOnly, favorites]);

  const toggleSelection = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedItems.length === filteredLicitaciones.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredLicitaciones.map(l => l.id));
    }
  };

  // Helper for compact date view
  const getDaysRemaining = (dateString: string) => {
    const today = new Date();
    const deadline = new Date(dateString);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Cerrada";
    if (diffDays === 0) return "Hoy";
    return `${diffDays}d`;
  };

  const getDeadlineColor = (dateString: string) => {
    const days = parseInt(getDaysRemaining(dateString));
    if (days <= 3) return "text-destructive font-bold";
    if (days <= 7) return "text-orange-500 font-medium";
    return "text-muted-foreground";
  };

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="mb-6 animate-fade-in flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
            Oportunidades
          </h1>
          <p className="mt-1 text-muted-foreground">
            Explora licitaciones activas en Mercado Público
          </p>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <Button variant="outline" className="gap-2 text-primary border-primary/20 bg-primary/5">
              <FileDown className="h-4 w-4" />
              Exportar ({selectedItems.length})
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center animate-fade-in" style={{ animationDelay: "100ms" }}>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
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
        <Button
          variant={showFavoritesOnly ? "default" : "outline"}
          size="icon"
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={showFavoritesOnly ? "bg-yellow-400 hover:bg-yellow-500 text-yellow-900 border-yellow-400" : ""}
          title="Ver Favoritos"
        >
          <Star className={`h-4 w-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden animate-fade-in shadow-sm" style={{ animationDelay: "200ms" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 w-[40px]">
                  <Checkbox
                    checked={selectedItems.length === filteredLicitaciones.length && filteredLicitaciones.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground w-[80px]">Match</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Título</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground w-[120px] hidden md:table-cell">Monto</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground w-[100px]">Cierre</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground w-[100px] hidden sm:table-cell">Estado</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground w-[160px]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLicitaciones.map((licitacion, index) => {
                const matchScore = calculateMatchScore(licitacion);
                const isFavorite = favorites.includes(licitacion.id);

                return (
                  <tr
                    key={licitacion.id}
                    className="group transition-colors hover:bg-muted/30 animate-fade-in"
                    style={{ animationDelay: `${250 + index * 30}ms` }}
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedItems.includes(licitacion.id)}
                        onCheckedChange={() => toggleSelection(licitacion.id)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className={`font-bold ${matchScore > 85 ? 'text-emerald-600' : 'text-blue-600'}`}>
                              {matchScore}%
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Coincidencia basada en palabras clave y categoría</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                    <td className="px-4 py-3 max-w-[300px]">
                      <div className="flex flex-col">
                        <span className="font-medium truncate text-foreground group-hover:text-primary transition-colors cursor-pointer" title={licitacion.titulo}>
                          {licitacion.titulo}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span className="font-mono">{licitacion.id}</span>
                          <span className="hidden sm:inline">• {licitacion.organismo}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell font-mono text-muted-foreground">
                      {formatCurrency(licitacion.montoEstimado)}
                    </td>
                    <td className="px-4 py-3">
                      <div className={`text-xs ${getDeadlineColor(licitacion.fechaCierre)}`}>
                        {getDaysRemaining(licitacion.fechaCierre)}
                      </div>
                      <div className="text-[10px] text-muted-foreground hidden sm:block">
                        {formatDate(licitacion.fechaCierre)}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-2 py-0 border-0 
                          ${licitacion.estado === "Abierta" ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20" : ""}
                          ${licitacion.estado === "Por Cerrar" ? "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20" : ""}
                        `}
                      >
                        {licitacion.estado}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-yellow-100 hover:text-yellow-600"
                          onClick={() => handleToggleFavorite(licitacion.id)}
                        >
                          <Star className={`h-4 w-4 ${isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                        </Button>

                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="font-semibold leading-none flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-500" /> Análisis Rápido IA
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Licitación de alta complejidad técnica. Requiere boleta de garantía por 5%.
                              </p>
                              <div className="flex gap-2 text-xs font-medium pt-2">
                                <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Margin: Alto</span>
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Competencia: Media</span>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>

                        <Link to={`/postular/${licitacion.id}`}>
                          <Button size="sm" className="h-8 px-3 ml-1 bg-primary text-primary-foreground hover:bg-primary/90">
                            Postular
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
