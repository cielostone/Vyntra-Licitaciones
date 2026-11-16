import React, { useEffect } from "react";
import { CalendarClock, ArrowRight, Activity, Zap, Radar, FileCheck2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { formatCurrency } from "@/data/licitaciones";
import { useVyntra } from "@/context/VyntraContext";
import { useMatchProfile } from "@/hooks/useMatchProfile";
import { calculateMatch } from "@/lib/matching";
import { Link } from "react-router-dom";
import { useLicitaciones } from "@/hooks/useLicitaciones";
import { Loader2, Trophy, Sparkles, Bot, Search, MessageSquare, FileText } from "lucide-react";
export default function Dashboard() {
  const { licitaciones, loading, prefetchDetalles } = useLicitaciones();
  const { drafts } = useVyntra();
  const { profile: matchProfile } = useMatchProfile();

  const recentLicitaciones = licitaciones.slice(0, 5);
  const recentIds = recentLicitaciones.map((l) => l.id).join(",");
  // Los hooks van ANTES del return de carga (si no, React se cae al terminar de cargar)
  useEffect(() => {
    if (!recentIds) return;
    const signal = { cancelled: false };
    prefetchDetalles(recentIds.split(","), signal);
    return () => { signal.cancelled = true; };
  }, [recentIds, prefetchDetalles]);

  if (loading) {
    return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-indigo-500 opacity-50" /></div>;
  }

  // KPIs reales: mercado en vivo + postulaciones propias
  const compatibles = matchProfile
    ? licitaciones.filter((l) => (calculateMatch(l, matchProfile)?.score ?? 0) >= 50)
    : [];
  const enSieteDias = (fecha: string) => {
    const dias = (new Date(fecha).getTime() - Date.now()) / 86_400_000;
    return dias >= 0 && dias <= 7;
  };
  const cierranPronto = (matchProfile ? compatibles : licitaciones).filter((l) => enSieteDias(l.fechaCierre));
  const enviadas = drafts.filter((d) => d.status === "submitted").length;
  const borradores = drafts.filter((d) => !d.status || d.status === "draft").length;

  // Tasa de éxito: postulaciones propias ganadas / terminadas
  const ganadas = drafts.filter((d) => d.status === "won").length;
  const terminadas = ganadas + drafts.filter((d) => d.status === "lost").length;
  const winRate = terminadas > 0 ? ((ganadas / terminadas) * 100).toFixed(1) : "0.0";

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-10 max-w-7xl mx-auto">
      
      {/* Header Premium */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest backdrop-blur-md mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Sistema Activo
        </div>
        <h1 className="text-3xl font-extrabold text-foreground md:text-4xl tracking-tight">
          Panel de Control <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">Vyntra</span>
        </h1>
        <p className="text-lg text-muted-foreground font-medium max-w-2xl">
          Monitoreo en tiempo real de tu inteligencia financiera y radar de licitaciones públicas.
        </p>
      </div>

      {/* Financial KPIs */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
        <StatCard
          title="Licitaciones activas"
          value={licitaciones.length.toLocaleString("es-CL")}
          subtitle="En vivo desde Mercado Público"
          icon={Activity}
        />
        <StatCard
          title="Compatibles contigo"
          value={matchProfile ? compatibles.length.toLocaleString("es-CL") : "—"}
          subtitle={matchProfile ? "Calce de 50% o más con tu perfil" : "Configura tu perfil en Configuración"}
          icon={Radar}
        />
        <StatCard
          title="Cierran en 7 días"
          value={cierranPronto.length.toLocaleString("es-CL")}
          subtitle={matchProfile ? "De las compatibles contigo" : "De todas las activas"}
          icon={CalendarClock}
        />
        <StatCard
          title="Mis postulaciones"
          value={enviadas + borradores}
          subtitle={`${enviadas} enviadas · ${borradores} en borrador`}
          icon={FileCheck2}
        />
      </div>

      {/* Second Row: Advanced Insights B2B */}
      <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 items-start">
        
        {/* Copiloto IA Vyntra */}
        <Card className="relative overflow-hidden border-indigo-500/20 bg-card/80 backdrop-blur-xl shadow-xl rounded-2xl h-full lg:col-span-1">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />
          <CardHeader className="relative z-10 pb-2">
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-500">
                <Sparkles className="h-5 w-5" />
              </div>
              Copiloto IA Vyntra
            </CardTitle>
            <CardDescription className="text-sm font-medium">
              Asistente estratégico para análisis y redacción B2B.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 pt-4 pb-6 space-y-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative flex items-center bg-background border border-indigo-500/30 rounded-xl px-2 shadow-sm">
                <Bot className="h-5 w-5 text-indigo-400 ml-2" />
                <Input 
                  placeholder="¿Qué necesitas analizar o redactar hoy...?"
                  className="border-none focus-visible:ring-0 bg-transparent text-sm h-12"
                />
                <Button size="icon" className="h-8 w-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 mr-1">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 pt-2">
              <button className="flex items-center gap-2 text-sm font-semibold text-muted-foreground bg-muted/30 hover:bg-indigo-500/10 hover:text-indigo-600 transition-colors p-3 rounded-xl border border-transparent hover:border-indigo-500/20 text-left">
                <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
                Redactar resumen ejecutivo para licitación...
              </button>
              <button className="flex items-center gap-2 text-sm font-semibold text-muted-foreground bg-muted/30 hover:bg-indigo-500/10 hover:text-indigo-600 transition-colors p-3 rounded-xl border border-transparent hover:border-indigo-500/20 text-left">
                <Search className="h-4 w-4 text-indigo-400 shrink-0" />
                Encontrar oportunidades abiertas hoy en mi rubro
              </button>
              <button className="flex items-center gap-2 text-sm font-semibold text-muted-foreground bg-muted/30 hover:bg-indigo-500/10 hover:text-indigo-600 transition-colors p-3 rounded-xl border border-transparent hover:border-indigo-500/20 text-left">
                <MessageSquare className="h-4 w-4 text-indigo-400 shrink-0" />
                Evaluar riesgo comercial según anexos técnicos...
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Win Rate Insight */}
        <Card className="relative overflow-hidden border-indigo-500/10 bg-gradient-to-br from-card/80 to-indigo-900/5 backdrop-blur-xl shadow-xl rounded-2xl h-full">
          <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:16px_16px] dark:bg-grid-white/[0.02]" />
          <CardHeader className="relative z-10 pb-2">
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-500">
                <Trophy className="h-5 w-5" />
              </div>
              Tasa de Éxito (Win-Rate)
            </CardTitle>
            <CardDescription className="text-sm font-medium">
              Conversión histórica de tus cotizaciones vs adjudicaciones.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 pt-4 pb-6">
            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                 <p className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">
                   {winRate}%
                 </p>
              </div>
              <p className="text-sm text-foreground/80 font-medium leading-relaxed">
                El algoritmo calcula tu eficacia cruzando cuántas de tus propuestas se adjudicaron, versus todas las licitaciones que cotizaste y se cerraron.
              </p>
              <Progress value={Number(winRate)} className="h-3 my-6 rounded-full" indicatorClassName="bg-gradient-to-r from-indigo-500 to-violet-500" />
              <div className="flex gap-2 text-sm">
                 <Badge variant="outline" className="border-indigo-500/20 text-indigo-500 font-bold bg-indigo-500/10">
                   {terminadas > 0 ? `${ganadas} ganadas de ${terminadas}` : "Aún sin postulaciones cerradas"}
                 </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Últimas Oportunidades
          </h2>
          <Button variant="ghost" className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 font-bold" asChild>
            <Link to="/oportunidades">
              Ver Radar Completo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-card/50 backdrop-blur-xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-slate-900/50">
                  <th className="px-6 py-4 text-left font-bold text-muted-foreground uppercase tracking-widest text-[11px]">ID</th>
                  <th className="px-6 py-4 text-left font-bold text-muted-foreground uppercase tracking-widest text-[11px]">Título de Licencia</th>
                  <th className="px-6 py-4 text-left font-bold text-muted-foreground uppercase tracking-widest text-[11px]">Organismo Comprador</th>
                  <th className="px-6 py-4 text-left font-bold text-muted-foreground uppercase tracking-widest text-[11px]">Monto Neto</th>
                  <th className="px-6 py-4 text-left font-bold text-muted-foreground uppercase tracking-widest text-[11px]">Estado Actual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {recentLicitaciones.map((licitacion, index) => (
                  <tr
                    key={licitacion.id}
                    className="group transition-all hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-5 font-mono font-medium text-indigo-600 dark:text-indigo-400">{licitacion.id}</td>
                    <td className="px-6 py-5">
                      <p className="font-semibold text-foreground line-clamp-2 max-w-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {licitacion.titulo}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-muted-foreground font-medium">{licitacion.organismo}</td>
                    <td className="px-6 py-5 font-bold text-foreground">{formatCurrency(licitacion.montoEstimado)}</td>
                    <td className="px-6 py-5">
                      <Badge
                        variant="outline"
                        className={`font-bold px-3 py-1 rounded-full border border-transparent
                          ${licitacion.estado === "Abierta" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : ""}
                          ${licitacion.estado === "Por Cerrar" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" : ""}
                          ${licitacion.estado === "Adjudicada" ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" : ""}
                        `}
                      >
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
