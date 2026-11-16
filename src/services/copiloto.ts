import { supabase } from "@/integrations/supabase/client";
import type { Licitacion } from "@/services/mercadoPublico";
import type { MatchProfile } from "@/lib/matching";

interface CopilotoRequest {
  licitacion?: Licitacion;
  perfil?: MatchProfile | null;
  pregunta?: string;
}

// Llama a la Edge Function "copiloto" (Claude). supabase-js envía el JWT de la sesión.
export async function consultarCopiloto(req: CopilotoRequest): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ texto?: string; error?: string }>("copiloto", {
    body: req,
  });

  if (error) {
    // Errores HTTP de la función traen el mensaje en el cuerpo
    const ctx = (error as { context?: Response }).context;
    if (ctx && typeof ctx.json === "function") {
      const body = await ctx.json().catch(() => null);
      if (body?.error) throw new Error(body.error);
    }
    throw new Error("No se pudo conectar con el Copiloto.");
  }
  if (!data?.texto) throw new Error(data?.error ?? "El Copiloto no devolvió respuesta.");
  return data.texto;
}
