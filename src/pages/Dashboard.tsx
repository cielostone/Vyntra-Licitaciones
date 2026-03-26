import React from "react";
import { TrendingUp, DollarSign, Target, CalendarClock, ArrowRight, Activity, Zap } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { formatCurrency, calculateTax } from "@/data/licitaciones";
import { Link } from "react-router-dom";
import { useLicitaciones } from "@/hooks/useLicitaciones";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { licitaciones, loading } = useLicitaciones();

  if (loading) {
    return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-indigo-500 opacity-50" /></div>;
  }

  const recentLicitaciones = licitaciones.slice(0, 5);

  // KPIs Financieros
  const adjudicadas = licitaciones.filter(l => l.estado === "Adjudicada");
  const recaudacionTotalNeto = adjudicadas.reduce((acc, l) => acc + Number(l.montoEstimado), 0);
  const ivaDebitoAcumulado = calculateTax(recaudacionTotalNeto);
  const flujoMensual = recaudacionTotalNeto * 1.19; // Bruto

  // Metas (Simuladas)
  const metaMensual = 100000000; // 100M
  const progresoMeta = Math.min((recaudacionTotalNeto / metaMensual) * 100, 100);

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
          title="Recaudación Neta"
          value={formatCurrency(recaudacionTotalNeto)}
          subtitle="Ingresos adjudicados este mes"
          icon={DollarSign}
          trend={{ value: 15, positive: true }}
        />
        <StatCard
          title="IVA Débito"
          value={formatCurrency(ivaDebitoAcumulado)}
          subtitle="Provisión fiscal (19%)"
          icon={Activity}
        />
        <StatCard
          title="Flujo Estimado"
          value={formatCurrency(flujoMensual)}
          subtitle="Bruto proyectado"
          icon={TrendingUp}
        />
        
        {/* Goal Card Premium */}
        <Card className="group relative overflow-hidden rounded-2xl border-indigo-500/20 bg-card/60 backdrop-blur-xl shadow-lg hover:shadow-indigo-500/10 transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-colors duration-500" />
          <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Meta Mensual</CardTitle>
            <Target className="h-5 w-5 text-indigo-500" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold tracking-tight">{Math.round(progresoMeta)}%</div>
            <Progress 
                value={progresoMeta} 
                className="mt-4 h-2.5 bg-slate-200 dark:bg-slate-800" 
                indicatorClassName="bg-gradient-to-r from-indigo-500 to-violet-500" 
            />
            <p className="text-sm font-medium text-muted-foreground mt-3 flex justify-between">
              <span>{formatCurrency(recaudacionTotalNeto)}</span>
              <span className="text-foreground/70">{formatCurrency(metaMensual)}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Second Row: Insights & Assistant */}
      <div className="grid gap-6 md:grid-cols-3 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
        <Card className="col-span-2 relative overflow-hidden border-indigo-500/10 bg-gradient-to-br from-card/80 to-indigo-900/5 backdrop-blur-xl shadow-xl rounded-2xl">
          <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:16px_16px] dark:bg-grid-white/[0.02]" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <CalendarClock className="h-5 w-5 text-indigo-500" />
              </div>
              Insight: Horario Óptimo
            </CardTitle>
            <CardDescription className="text-base font-medium">
              Vyntra ha detectado un patrón de alta conversión en tus últimas ofertas.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-4">
            <div className="space-y-1">
              <p className="text-4xl font-black tracking-tight text-foreground">10:00 <span className="text-2xl text-muted-foreground">AM</span> - 12:30 <span className="text-2xl text-muted-foreground">PM</span></p>
              <div className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md mt-2">
                <TrendingUp className="h-4 w-4" />
                +35% de éxito histórico en este lapso
              </div>
            </div>
            <Button className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90 h-12 px-6 rounded-xl font-bold shadow-xl shadow-foreground/20 transition-all hover:scale-105 active:scale-95">
              Agendar Bloque
            </Button>
          </CardContent>
        </Card>

        {/* Vyntra Pet Card */}
        <div className="col-span-1">
          <VyntraPetCard progresoMeta={progresoMeta} />
        </div>
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

function VyntraPetCard({ progresoMeta }: { progresoMeta: number }) {
  const [rotation, setRotation] = React.useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [petType, setPetType] = React.useState<'dragon' | 'drone'>('drone');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHovering) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateY = ((x / rect.width) * 10) - 5;
    const rotateX = -(((y / rect.height) * 10) - 5);

    setRotation({ x: rotateX, y: rotateY });
  };

  const messages = [
    "Objetivo en curso.",
    "Analizando radar.",
    "Todo en orden.",
    "Sistema óptimo."
  ];

  const handlePetClick = () => {
    setMessage(messages[Math.floor(Math.random() * messages.length)]);
    setTimeout(() => setMessage(null), 3000);
  };

  const togglePetType = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPetType(prev => prev === 'dragon' ? 'drone' : 'dragon');
  }

  const petImage = petType === 'drone' ? "/pets/drone.png" : "/pets/dragon_v2.png";

  return (
    <div
      className="perspective-1000 h-full"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => { setIsHovering(false); setRotation({ x: 0, y: 0 }); }}
      onMouseMove={handleMouseMove}
    >
      <Card
        className="h-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white overflow-hidden relative border-none shadow-xl shadow-indigo-500/20 rounded-2xl"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out'
        }}
      >
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-bl-full blur-2xl"></div>

        <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-0">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-white/90 uppercase tracking-widest">
            <Activity className="h-4 w-4 text-indigo-200" />
            IA Asistente
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10 rounded-lg" onClick={togglePetType}>
            <Activity className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="text-center relative z-10 flex flex-col items-center justify-between h-[calc(100%-3rem)] pt-6">
          <div
            className="relative w-36 h-36 cursor-pointer group flex items-center justify-center transform transition-transform hover:scale-110"
            onClick={handlePetClick}
          >
            <img
              src={petImage}
              alt="Vyntra Pet"
              className="w-full h-full object-contain animate-float drop-shadow-2xl"
              style={{ animation: 'float 6s ease-in-out infinite' }}
            />
            {message && (
              <div className="absolute -top-6 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-bold border border-white/20 shadow-2xl animate-in zoom-in-50 duration-200">
                {message}
              </div>
            )}
          </div>

          <div className="w-full mt-auto pb-2">
            <div className="flex justify-between items-center mb-3">
              <div className="text-left">
                <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">Módulos</p>
                <p className="text-sm font-black text-white">EN LÍNEA</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">Sync</p>
                <p className="text-sm font-black text-white">{Math.round(progresoMeta)}%</p>
              </div>
            </div>
            <Progress value={progresoMeta} className="h-1.5 bg-black/20" indicatorClassName="bg-white" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
