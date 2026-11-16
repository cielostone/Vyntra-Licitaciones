import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { MatchProfile } from "@/lib/matching";

// Lee el perfil de búsqueda de la organización del usuario (RLS filtra por organización)
export function useMatchProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<MatchProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    supabase
      .from("match_configs")
      .select("keywords, categorias, regiones, monto_minimo, monto_maximo")
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) console.error("match_configs:", error);
        setProfile(
          data
            ? {
                keywords: data.keywords ?? [],
                categorias: data.categorias ?? [],
                regiones: data.regiones ?? [],
                monto_minimo: data.monto_minimo ?? null,
                monto_maximo: data.monto_maximo ?? null,
              }
            : null,
        );
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { profile, loading };
}
