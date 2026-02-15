import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Licitacion } from "@/data/licitaciones";
import { toast } from "sonner";

export const useLicitaciones = () => {
    const [licitaciones, setLicitaciones] = useState<Licitacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        const fetchLicitaciones = async () => {
            try {
                const { data, error } = await supabase
                    .from('licitaciones')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // Map database columns to application types if necessary
                // Currently they match: id, titulo, organismo, monto_estimado, etc.
                // But DB identifiers might be snake_case (e.g. monto_estimado) and TS is camelCase?
                // Let's assume the DB returns matching json or we need to map.
                // Supabase returns columns as they are in DB (snake_case usually).

                // Mapping DB (snake_case) to TS Model (camelCase)
                const mappedData: Licitacion[] = (data || []).map((item: any) => ({
                    id: item.id,
                    titulo: item.titulo,
                    organismo: item.organismo,
                    montoEstimado: item.monto_estimado,
                    fechaCierre: item.fecha_cierre,
                    estado: item.estado,
                    categoria: item.categoria,
                    fechaAdjudicacion: item.fecha_adjudicacion,
                    description: item.description
                }));

                setLicitaciones(mappedData);
            } catch (err: any) {
                console.error("Error fetching licitaciones:", err);
                setError(err);
                toast.error("Error cargando licitaciones");
            } finally {
                setLoading(false);
            }
        };

        fetchLicitaciones();
    }, []);

    return { licitaciones, loading, error };
};
