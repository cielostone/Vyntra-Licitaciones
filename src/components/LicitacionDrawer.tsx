import { useEffect, useState } from "react";
import { X, ExternalLink, Building2, Calendar, Tag, MapPin, Loader2, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { fetchLicitacionPorCodigo, type Licitacion } from "@/services/mercadoPublico";
import { formatCurrency, formatDate } from "@/data/licitaciones";
import { consultarCopiloto } from "@/services/copiloto";
import { useMatchProfile } from "@/hooks/useMatchProfile";
import { CopilotoRespuesta } from "@/components/CopilotoRespuesta";

interface LicitacionDrawerProps {
  licitacionId: string | null;
  onClose: () => void;
}

export function LicitacionDrawer({ licitacionId, onClose }: LicitacionDrawerProps) {
  const [detalle, setDetalle] = useState<Licitacion | null>(null);
  const [loading, setLoading] = useState(false);
  const { profile } = useMatchProfile();
  const [resumen, setResumen] = useState<string | null>(null);
  const [resumiendo, setResumiendo] = useState(false);
  const [errorIA, setErrorIA] = useState<string | null>(null);

  const resumirConIA = async () => {
    if (!detalle) return;
    setResumiendo(true);
    setErrorIA(null);
    try {
      setResumen(await consultarCopiloto({ licitacion: detalle, perfil: profile }));
    } catch (e) {
      setErrorIA(e instanceof Error ? e.message : "Error del Copiloto");
    } finally {
      setResumiendo(false);
    }
  };

  useEffect(() => {
    if (!licitacionId) return;
    setResumen(null);
    setErrorIA(null);
    setDetalle(null);
    setLoading(true);
    fetchLicitacionPorCodigo(licitacionId)
      .then(setDetalle)
      .catch(() => setDetalle(null))
      .finally(() => setLoading(false));
  }, [licitacionId]);

  const isOpen = !!licitacionId;

  return (
    <>
      {/* Overlay oscuro */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Panel lateral */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-xl bg-background border-l border-border shadow-2xl
          transform transition-transform duration-300 ease-out flex flex-col
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-muted-foreground font-mono">
              {licitacionId}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <p className="text-sm">Cargando detalles desde Mercado Público...</p>
            </div>
          )}

          {!loading && detalle && (
            <>
              {/* Título */}
              <div>
                <h2 className="text-lg font-bold text-foreground leading-snug">
                  {detalle.titulo}
                </h2>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={`text-xs border-0 ${
                      detalle.estado === "Abierta"
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                        : "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20"
                    }`}
                  >
                    {detalle.estado}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{detalle.categoria}</span>
                </div>
              </div>

              {/* Copiloto IA */}
              {resumen ? (
                <CopilotoRespuesta texto={resumen} />
              ) : (
                <div className="space-y-2">
                  <Button
                    onClick={resumirConIA}
                    disabled={resumiendo}
                    className="w-full gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white"
                  >
                    {resumiendo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {resumiendo ? "El Copiloto está leyendo la licitación..." : "Explícamela en simple (IA)"}
                  </Button>
                  {errorIA && <p className="text-xs text-destructive">{errorIA}</p>}
                </div>
              )}

              {/* Metadata en grid */}
              <div className="grid grid-cols-2 gap-4">
                <InfoCard
                  icon={<Building2 className="h-4 w-4" />}
                  label="Organismo"
                  value={detalle.organismo}
                />
                <InfoCard
                  icon={<Tag className="h-4 w-4" />}
                  label="Monto Estimado"
                  value={detalle.montoEstimado > 0 ? formatCurrency(detalle.montoEstimado) : "No informado"}
                  highlight={detalle.montoEstimado > 0}
                />
                <InfoCard
                  icon={<Calendar className="h-4 w-4" />}
                  label="Cierre de Ofertas"
                  value={detalle.fechaCierre ? formatDate(detalle.fechaCierre) : "—"}
                  urgent={isUrgent(detalle.fechaCierre)}
                />
                <InfoCard
                  icon={<Calendar className="h-4 w-4" />}
                  label="Fecha Publicación"
                  value={detalle.fechaPublicacion ? formatDate(detalle.fechaPublicacion) : "—"}
                />
                {detalle.region && (
                  <InfoCard
                    icon={<MapPin className="h-4 w-4" />}
                    label="Región"
                    value={detalle.region}
                  />
                )}
              </div>

              {/* Descripción */}
              {detalle.description && detalle.description !== detalle.titulo && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Descripción
                  </p>
                  <p className="text-sm text-foreground leading-relaxed bg-muted/40 rounded-lg p-4 border border-border">
                    {detalle.description}
                  </p>
                </div>
              )}

              {/* Aviso si datos básicos */}
              {detalle.montoEstimado === 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
                  💡 El monto y descripción completa están disponibles en el portal oficial de Mercado Público.
                </div>
              )}
            </>
          )}

          {!loading && !detalle && licitacionId && (
            <div className="text-center py-20 text-muted-foreground text-sm">
              No se pudo cargar la información de esta licitación.
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        {detalle && (
          <div className="shrink-0 border-t border-border px-6 py-4 flex gap-3">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => window.open(detalle.fuente_url, "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
              Ver en Mercado Público
            </Button>
            <Link to={`/postular/${licitacionId}`} className="flex-1">
              <Button className="w-full gap-2">
                <FileText className="h-4 w-4" />
                Preparar Oferta
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

function InfoCard({
  icon,
  label,
  value,
  highlight = false,
  urgent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  urgent?: boolean;
}) {
  return (
    <div className="bg-muted/40 border border-border rounded-lg p-3 space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className={`text-sm font-semibold leading-snug ${
        highlight ? "text-emerald-600" :
        urgent ? "text-destructive" :
        "text-foreground"
      }`}>
        {value}
      </p>
    </div>
  );
}

function isUrgent(fechaCierre: string): boolean {
  if (!fechaCierre) return false;
  const diff = new Date(fechaCierre).getTime() - Date.now();
  return diff < 3 * 24 * 60 * 60 * 1000; // menos de 3 días
}
