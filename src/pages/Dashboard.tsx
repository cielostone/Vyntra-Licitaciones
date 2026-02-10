import React from "react";
import { TrendingUp, DollarSign, Target, CalendarClock, ArrowRight, Activity } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { licitaciones, formatCurrency, formatDate, calculateTax } from "@/data/licitaciones";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const recentLicitaciones = licitaciones.slice(0, 5);

  // KPIs Financieros
  const adjudicadas = licitaciones.filter(l => l.estado === "Adjudicada");
  const recaudacionTotalNeto = adjudicadas.reduce((acc, l) => acc + l.montoEstimado, 0);
  const ivaDebitoAcumulado = calculateTax(recaudacionTotalNeto);
  const flujoMensual = recaudacionTotalNeto * 1.19; // Bruto

  // Metas (Simuladas)
  const metaMensual = 100000000; // 100M
  const progresoMeta = Math.min((recaudacionTotalNeto / metaMensual) * 100, 100);

  return (
    <div className="p-6 md:p-8 lg:p-10 space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-slate-800 md:text-3xl tracking-tight">
          Panel de Control <span className="text-primary">Vyntra</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Gestión financiera y monitoreo de licitaciones
        </p>
      </div>

      {/* Financial KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-fade-in" style={{ animationDelay: "100ms" }}>
        <StatCard
          title="Recaudación Neta"
          value={formatCurrency(recaudacionTotalNeto)}
          subtitle="Ingresos por adjudicaciones"
          icon={DollarSign}
          trend={{ value: 15, positive: true }}
        />
        <StatCard
          title="IVA Débito"
          value={formatCurrency(ivaDebitoAcumulado)}
          subtitle="Impuestos acumulados (19%)"
          icon={Activity}
        />
        <StatCard
          title="Flujo Bruto Mensual"
          value={formatCurrency(flujoMensual)}
          subtitle="Total facturable estimado"
          icon={TrendingUp}
        />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meta Mensual</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(progresoMeta)}%</div>
            <Progress value={progresoMeta} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {formatCurrency(recaudacionTotalNeto)} / {formatCurrency(metaMensual)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 animate-fade-in" style={{ animationDelay: "150ms" }}>
        <Card className="col-span-2 bg-gradient-to-br from-card to-secondary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              Horario de Alta Productividad
            </CardTitle>
            <CardDescription>
              Según el historial, este es tu mejor momento para ofertar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">10:00 AM - 12:30 PM</p>
                <p className="text-sm text-success font-medium mt-1">
                  +35% tasa de adjudicación en este horario
                </p>
              </div>
              <Button>Agendar Sesión de Oferta</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <div className="mt-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Últimas Licitaciones</h2>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Monto Neto</th>
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
                    <td className="px-4 py-4">
                      <Badge
                        variant="outline"
                        className={`
                          ${licitacion.estado === "Abierta" ? "bg-success/10 text-success border-success/20" : ""}
                          ${licitacion.estado === "Por Cerrar" ? "bg-warning/10 text-warning border-warning/20" : ""}
                          ${licitacion.estado === "Adjudicada" ? "bg-primary/10 text-primary border-primary/20" : ""}
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

  /* State para tipo de mascota: 'dragon' | 'drone' */
  const [petType, setPetType] = React.useState<'dragon' | 'drone'>('drone');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHovering) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Rotation sutil
    const rotateY = ((x / rect.width) * 10) - 5;
    const rotateX = -(((y / rect.height) * 10) - 5);

    setRotation({ x: rotateX, y: rotateY });
  };

  const messages = [
    "Objetivo mensual al alcance.",
    "Analizando nuevas oportunidades.",
    "Se sugiere revisar licitaciones pendientes.",
    "Sistema optimizado.",
    "Buen rendimiento, sigue así."
  ];

  const handlePetClick = () => {
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    setMessage(randomMsg);
    setTimeout(() => setMessage(null), 3000);
  };

  const togglePetType = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPetType(prev => prev === 'dragon' ? 'drone' : 'dragon');
  }

  // Logic for pet image based on type and progress
  let petImage = "";
  // Usamos el drone V1 (blanco) para el modo light, el drone v2 no se si lo generé
  if (petType === 'drone') {
    petImage = "/pets/drone.png"; // El drone blanco queda perfecto en fondo claro
  } else {
    petImage = "/pets/dragon_v2.png"; // El dragón azul contrasta bien en blanco también
  }

  return (
    <div
      className="perspective-1000"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setRotation({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
    >
      <Card
        className="bg-white text-foreground overflow-hidden relative border border-blue-100 shadow-lg shadow-blue-500/5"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out'
        }}
      >
        {/* Fondo decorativo muy sutil */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full opacity-50"></div>

        <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
            <Activity className="h-4 w-4" />
            Asistente Vyntra
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-blue-50" onClick={togglePetType}>
            <Activity className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="text-center relative z-10 flex flex-col items-center pt-2">
          <div
            className="relative w-48 h-48 mb-2 cursor-pointer group flex items-center justify-center"
            onClick={handlePetClick}
          >
            {/* Pet Image - Clean integration */}
            <img
              src={petImage}
              alt="Vyntra Pet"
              // En modo light, mix-blend-screen puede hacer desaparecer cosas si el fondo es blanco. 
              // Mejor usar imagen normal con transparencia para el drone blanco.
              // Si es el dragón holográfico (negro de fondo), sí necesitamos screen.
              className={`w-full h-full object-contain animate-float filter drop-shadow-xl ${petType === 'dragon' ? 'mix-blend-screen invert-0' : ''}`}
              style={{ animation: 'float 6s ease-in-out infinite' }}
            />

            {/* Message Toast */}
            {message && (
              <div className="absolute -top-4 bg-white text-primary px-3 py-1.5 rounded-full text-xs font-medium border border-blue-100 shadow-xl animate-bounce">
                {message}
              </div>
            )}
          </div>

          <div className="w-full px-2">
            <div className="flex justify-between items-center mb-2">
              <div className="text-left">
                <p className="text-xs text-muted-foreground font-medium">ESTADO</p>
                <p className="text-sm font-bold text-primary">ACTIVO</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-medium">SINCRONIZACIÓN</p>
                <p className="text-sm font-bold text-primary">{Math.round(progresoMeta)}%</p>
              </div>
            </div>

            <Progress value={progresoMeta} className="h-2 bg-blue-50" indicatorClassName="bg-gradient-to-r from-blue-600 to-blue-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
