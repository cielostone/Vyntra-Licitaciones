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
            const data = await fetchLicitacionesActivas();
            setLicitaciones(data);
            setLastSync(new Date());
        } catch (err: any) {
            console.error("Error cargando licitaciones:", err);

            // Si falla la API, intentar con caché en localStorage
            const cached = localStorage.getItem("vyntra_licitaciones_cache");
            if (cached) {
                try {
                    const { data, timestamp } = JSON.parse(cached);
                    setLicitaciones(data);
                    setLastSync(new Date(timestamp));
                    setError("⚠️ Mostrando datos en caché (sin conexión a Mercado Público)");
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
