
import { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast } from "@/hooks/use-toast";
import { Search, Star, FileDown, Eye, AlertTriangle, CheckCircle2 } from "lucide-react";
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
import { formatCurrency, formatDate } from "@/data/licitaciones";
import type { LicitacionStatus } from "@/data/licitaciones";
import { calculateMatchScore } from "@/lib/matching";
import { useVyntra } from "@/context/VyntraContext";
import { useLicitaciones } from "@/hooks/useLicitaciones";
import { Loader2 } from "lucide-react";
import { LicitacionDrawer } from "@/components/LicitacionDrawer";

export default function Oportunidades() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LicitacionStatus | "Todas">("Todas");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedLicitacionId, setSelectedLicitacionId] = useState<string | null>(null);
  const PAGE_SIZE = 50;

  // Debounce: retrasa el filtro 300ms después del último keystroke
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { licitaciones, loading } = useLicitaciones();
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

  // Filtrado con debouncedSearch (no searchQuery) para evitar lag
  const filteredLicitaciones = useMemo(() => {
    if (loading) return [];
    const q = debouncedSearch.toLowerCase();
    return licitaciones.filter((licitacion) => {
      const matchesSearch = !q ||
        licitacion.titulo.toLowerCase().includes(q) ||
        licitacion.organismo.toLowerCase().includes(q) ||
        licitacion.id.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "Todas" || licitacion.estado === statusFilter;
      const matchesFavorite = showFavoritesOnly ? favorites.includes(licitacion.id) : true;
      return matchesSearch && matchesStatus && matchesFavorite;
    });
  }, [debouncedSearch, statusFilter, showFavoritesOnly, favorites, licitaciones, loading]);

  // Paginación — renderizar solo PAGE_SIZE filas a la vez
  const totalPages = Math.ceil(filteredLicitaciones.length / PAGE_SIZE);
  const paginatedLicitaciones = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredLicitaciones.slice(start, start + PAGE_SIZE);
  }, [filteredLicitaciones, page]);

  // Reset página al cambiar filtros
  useMemo(() => { setPage(1); }, [debouncedSearch, statusFilter, showFavoritesOnly]);

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
    <div className="p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto">
      <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest backdrop-blur-md mb-1">
            Radar Activo
          </div>
          <h1 className="text-3xl font-extrabold text-foreground md:text-4xl tracking-tight">
            Oportunidades
          </h1>
          <p className="mt-1 text-lg font-medium text-muted-foreground">
            Explora licitaciones activas en Mercado Público con inteligencia artificial
          </p>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/25">
              <FileDown className="h-4 w-4" />
              Exportar ({selectedItems.length})
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar por palabra clave, ID o institución..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 bg-white/70 dark:bg-card/40 border-slate-200 dark:border-white/10 backdrop-blur-xl focus-visible:ring-indigo-500/50 shadow-sm rounded-xl font-medium"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LicitacionStatus | "Todas")}>
          <SelectTrigger className="w-48 h-12 bg-white/70 dark:bg-card/40 border-slate-200 dark:border-white/10 backdrop-blur-xl focus-visible:ring-indigo-500/50 shadow-sm rounded-xl font-medium">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 backdrop-blur-xl shadow-xl">
            <SelectItem value="Todas" className="font-medium">Todas las licitaciones</SelectItem>
            <SelectItem value="Abierta" className="font-medium text-emerald-600 dark:text-emerald-400">Abierta</SelectItem>
            <SelectItem value="Por Cerrar" className="font-medium text-amber-600 dark:text-amber-400">Por Cerrar</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={showFavoritesOnly ? "default" : "outline"}
          size="icon"
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`h-12 w-12 rounded-xl border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-xl transition-all ${showFavoritesOnly ? "bg-amber-400 hover:bg-amber-500 text-amber-900 border-amber-400 shadow-amber-400/20" : "bg-white/70 dark:bg-card/40 hover:bg-slate-100 dark:hover:bg-white/5"}`}
          title="Ver Favoritos"
        >
          <Star className={`h-5 w-5 ${showFavoritesOnly ? "fill-current" : "text-slate-400 hover:text-amber-500"}`} />
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-card/50 backdrop-blur-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-slate-900/50">
                <th className="px-6 py-4 w-[60px]">
                  <Checkbox
                    checked={selectedItems.length === filteredLicitaciones.length && filteredLicitaciones.length > 0}
                    onCheckedChange={toggleAll}
                    className="border-slate-300 dark:border-slate-600 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                  />
                </th>
                <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[11px] w-[100px]">Match AI</th>
                <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[11px]">Título de Oportunidad</th>
                <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[11px] w-[140px] hidden md:table-cell">Monto Neto</th>
                <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[11px] w-[120px]">Cierre</th>
                <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[11px] w-[120px] hidden sm:table-cell">Estado</th>
                <th className="px-6 py-4 text-right font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[11px] w-[200px]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 text-indigo-500 dark:text-indigo-400">
                      <Loader2 className="h-10 w-10 animate-spin" />
                      <p className="font-bold text-lg text-foreground">Sincronizando Radar de Oportunidades...</p>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Conectando a Mercado Público, por favor espera un momento.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedLicitaciones.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-24 text-center text-slate-500 font-medium text-lg">
                    No se encontraron licitaciones en este momento.
                  </td>
                </tr>
              ) : (
                paginatedLicitaciones.map((licitacion, index) => {
                const matchScore = calculateMatchScore(licitacion);
                const isFavorite = favorites.includes(licitacion.id);

                return (
                  <tr
                    key={licitacion.id}
                    className="group transition-all hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-4">
                      <Checkbox
                        checked={selectedItems.includes(licitacion.id)}
                        onCheckedChange={() => toggleSelection(licitacion.id)}
                        className="border-slate-300 dark:border-slate-600 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className={`inline-flex items-center justify-center font-bold px-2.5 py-1 rounded-lg ${matchScore > 85 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'}`}>
                              {matchScore}%
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-900 border-white/10 text-white font-medium shadow-2xl">
                            <p>Score de compatibilidad basado en el Radar Vyntra</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                    <td className="px-6 py-4 max-w-[350px]">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer hover:underline underline-offset-4 line-clamp-2" title={licitacion.titulo} onClick={() => setSelectedLicitacionId(licitacion.id)}>
                          {licitacion.titulo}
                        </span>
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                          <span className="font-mono text-indigo-500 dark:text-indigo-400">{licitacion.id}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline truncate">{licitacion.organismo}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell font-bold text-foreground">
                      {formatCurrency(licitacion.montoEstimado)}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm ${getDeadlineColor(licitacion.fechaCierre)}`}>
                        {getDaysRemaining(licitacion.fechaCierre)}
                      </div>
                      <div className="text-[11px] font-medium text-muted-foreground hidden sm:block mt-0.5">
                        {formatDate(licitacion.fechaCierre)}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <Badge
                        variant="outline"
                        className={`font-bold px-3 py-1 rounded-full border border-transparent whitespace-nowrap
                          ${licitacion.estado === "Abierta" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : ""}
                          ${licitacion.estado === "Por Cerrar" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" : ""}
                        `}
                      >
                        {licitacion.estado}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/10"
                          onClick={() => handleToggleFavorite(licitacion.id)}
                        >
                          <Star className={`h-4 w-4 ${isFavorite ? "fill-amber-400 text-amber-500" : "text-slate-400 hover:text-amber-500"}`} />
                        </Button>

                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-0 overflow-hidden border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl rounded-2xl">
                            <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/50">
                                <h4 className="font-bold text-sm tracking-wide flex items-center gap-2 text-foreground">
                                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Análisis Rápido IA
                                </h4>
                            </div>
                            <div className="p-4 space-y-3">
                                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                                  Licitación de alta complejidad técnica. Requiere boleta de garantía por 5%.
                                </p>
                                <div className="flex gap-2">
                                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-none font-bold">Margin: Alto</Badge>
                                  <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 shadow-none font-bold">Competencia: Media</Badge>
                                </div>
                            </div>
                          </PopoverContent>
                        </Popover>

                        <Link to={`/postular/${licitacion.id}`}>
                          <Button size="sm" className="h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95">
                            Postular
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-medium text-slate-500 dark:text-slate-400 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
          <span>
            Mostrando <span className="text-foreground font-bold">{((page - 1) * PAGE_SIZE) + 1}</span> a <span className="text-foreground font-bold">{Math.min(page * PAGE_SIZE, filteredLicitaciones.length)}</span> de <span className="text-foreground font-bold">{filteredLicitaciones.length}</span> licitaciones
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 h-9 rounded-lg border-slate-200 dark:border-white/10 bg-white/50 dark:bg-card/40 backdrop-blur-xl hover:bg-slate-100 dark:hover:bg-white/5 font-bold shadow-sm"
            >
              Anterior
            </Button>
            <div className="flex px-4 h-9 items-center justify-center font-mono font-bold bg-white/50 dark:bg-card/40 border border-slate-200 dark:border-white/10 rounded-lg shadow-sm">
              {page} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 h-9 rounded-lg border-slate-200 dark:border-white/10 bg-white/50 dark:bg-card/40 backdrop-blur-xl hover:bg-slate-100 dark:hover:bg-white/5 font-bold shadow-sm"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Drawer de detalle — se abre al hacer click en el título */}
      <LicitacionDrawer
        licitacionId={selectedLicitacionId}
        onClose={() => setSelectedLicitacionId(null)}
      />
    </div>
  );
}
