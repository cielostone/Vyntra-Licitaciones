import { useEffect, useState } from "react";
import { fetchLicitacionesActivas, Licitacion } from "@/services/mercadoPublico";

// Re-exportamos el tipo para que el resto de la app no tenga que cambiar imports
export type { Licitacion };

export const useLicitaciones = () => {
    const [licitaciones, setLicitaciones] = useState<Licitacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastSync, setLastSync] = useState<Date | null>(null);

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
        licitaciones,
        loading,
        error,
        lastSync,
        refetch: fetchData,   // Para el botón de sincronización manual
    };
};
