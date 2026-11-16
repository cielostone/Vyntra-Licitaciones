import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchLicitacionesActivas, fetchLicitacionPorCodigo, Licitacion } from "@/services/mercadoPublico";

// ─────────────────────────────────────────────
// Caché de DETALLES (organismo, monto, región, descripción).
// El listado de MP no los trae; se piden por código y se guardan
// a nivel de módulo + localStorage para que sobrevivan entre páginas.
// ─────────────────────────────────────────────
const DETALLES_KEY = "vyntra_detalles_cache";
const DETALLES_TTL = 12 * 60 * 60 * 1000; // 12 horas
type DetalleCache = Record<string, { d: Licitacion; t: number }>;

const detalles: DetalleCache = (() => {
    try {
        const raw = JSON.parse(localStorage.getItem(DETALLES_KEY) ?? "{}") as DetalleCache;
        const now = Date.now();
        return Object.fromEntries(Object.entries(raw).filter(([, v]) => now - v.t < DETALLES_TTL));
    } catch {
        return {};
    }
})();
const enCurso = new Set<string>();

const guardarDetalles = () => {
    try {
        localStorage.setItem(DETALLES_KEY, JSON.stringify(detalles));
    } catch {
        /* cuota llena: seguimos solo en memoria */
    }
};

// El estado y título vienen del listado (más fresco); el resto del detalle
const mezclar = (base: Licitacion): Licitacion => {
    const det = detalles[base.id]?.d;
    if (!det) return base;
    return {
        ...base,
        organismo: det.organismo,
        montoEstimado: det.montoEstimado,
        region: det.region,
        description: det.description,
        fechaPublicacion: det.fechaPublicacion,
        categoria: det.categoria,
    };
};

// Re-exportamos el tipo para que el resto de la app no tenga que cambiar imports
export type { Licitacion };

export const useLicitaciones = () => {
    const [licitaciones, setLicitaciones] = useState<Licitacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastSync, setLastSync] = useState<Date | null>(null);
    const [detallesVersion, setDetallesVersion] = useState(0);

    // Pide en background el detalle de los códigos visibles: lotes de 5, 200ms entre lotes
    const prefetchDetalles = useCallback(async (ids: string[], signal?: { cancelled: boolean }) => {
        const pendientes = ids.filter((id) => !detalles[id] && !enCurso.has(id));
        for (let i = 0; i < pendientes.length; i += 5) {
            if (signal?.cancelled) return;
            const lote = pendientes.slice(i, i + 5);
            lote.forEach((id) => enCurso.add(id));
            const res = await Promise.all(lote.map((id) => fetchLicitacionPorCodigo(id).catch(() => null)));
            lote.forEach((id) => enCurso.delete(id));
            res.forEach((d) => {
                if (d) detalles[d.id] = { d, t: Date.now() };
            });
            guardarDetalles();
            if (!signal?.cancelled) setDetallesVersion((v) => v + 1);
            await new Promise((r) => setTimeout(r, 200));
        }
    }, []);

    // Cuando el Drawer ya trajo el detalle, guardarlo sin volver a pedirlo
    const enrichLicitacion = useCallback((d: Licitacion) => {
        detalles[d.id] = { d, t: Date.now() };
        guardarDetalles();
        setDetallesVersion((v) => v + 1);
    }, []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const licitacionesConDetalle = useMemo(() => licitaciones.map(mezclar), [licitaciones, detallesVersion]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            // 1. Intentar usar Caché Fresco (menos de 5 minutos) para evitar la lentitud de M.P.
            const cached = localStorage.getItem("vyntra_licitaciones_cache");
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                const cacheAge = new Date().getTime() - new Date(timestamp).getTime();
                const isFresh = cacheAge < 5 * 60 * 1000; // 5 minutos de vida útil

                if (isFresh && data.length > 0) {
                    setLicitaciones(data);
                    setLastSync(new Date(timestamp));
                    setLoading(false);
                    return; // ¡Salir temprano y mostrar instantáneamente!
                }
            }

            // 2. Si no hay caché o es viejo, llamar a la API lenta
            const data = await fetchLicitacionesActivas();
            setLicitaciones(data);
            setLastSync(new Date());

            // 3. Guardar el nuevo caché
            localStorage.setItem("vyntra_licitaciones_cache", JSON.stringify({
                data: data,
                timestamp: new Date().toISOString(),
            }));
            
        } catch (err: any) {
            console.error("Error cargando licitaciones:", err);

            // 4. Si falla la API por sobrecarga, mostrar el caché viejo como rescate
            const cached = localStorage.getItem("vyntra_licitaciones_cache");
            if (cached) {
                try {
                    const { data, timestamp } = JSON.parse(cached);
                    setLicitaciones(data);
                    setLastSync(new Date(timestamp));
                    setError("⚠️ API de M.P. saturada. Mostrando versión anterior.");
                } catch {
                    setError("No se pudieron cargar las licitaciones");
                }
            } else {
                setError(err.message ?? "Error al conectar con Mercado Público");
            }
        } finally {
            setLoading(false);
        }
    };

    // Guardar en caché cuando los datos se actualizan exitosamente
    useEffect(() => {
        if (licitaciones.length > 0 && !error) {
            localStorage.setItem("vyntra_licitaciones_cache", JSON.stringify({
                data: licitaciones,
                timestamp: new Date().toISOString(),
            }));
        }
    }, [licitaciones, error]);

    useEffect(() => {
        fetchData();
    }, []);

    return {
        licitaciones: licitacionesConDetalle,
        prefetchDetalles,
        enrichLicitacion,
        loading,
        error,
        lastSync,
        refetch: fetchData,   // Para el botón de sincronización manual
    };
};
