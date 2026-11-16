// Copiloto IA Vyntra — Supabase Edge Function (Deno)
// Resume una licitación en lenguaje simple para una microempresa y responde preguntas.
// La API key de Anthropic vive como secreto del proyecto (ANTHROPIC_API_KEY), nunca en el frontend.
// verify_jwt de Supabase también deja pasar la anon key (pública), así que además
// se valida que el token sea de un usuario con sesión iniciada.
import Anthropic from "npm:@anthropic-ai/sdk";
import { createClient } from "npm:@supabase/supabase-js@2";

const MODEL = "claude-opus-5-5";
const MAX_PREGUNTA = 2000;
const MAX_DESCRIPCION = 20000;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

interface Licitacion {
  id: string;
  titulo: string;
  organismo?: string;
  montoEstimado?: number;
  fechaCierre?: string;
  fechaPublicacion?: string;
  estado?: string;
  categoria?: string;
  region?: string;
  description?: string;
}

interface Perfil {
  keywords?: string[];
  categorias?: string[];
  regiones?: string[];
}

const SYSTEM = `Eres el Copiloto de Vyntra, un asistente para micro y pequeñas empresas chilenas que quieren venderle al Estado por primera vez a través de Mercado Público.

Quien te lee probablemente nunca ha postulado a una licitación. Escribe en español de Chile, simple y directo, sin jerga legal; si usas un término técnico (garantía de seriedad, bases administrativas, Compra Ágil), explícalo en pocas palabras.

Trabajas solo con los datos que te entregan de la API de Mercado Público, que son un resumen: no tienes las bases completas ni los anexos. No inventes requisitos, montos, plazos ni garantías. Cuando algo importante no está en los datos, dilo y sugiere revisarlo en las bases de la ficha en Mercado Público.

No le pidas al usuario credenciales ni que te entregue su ClaveÚnica; la postulación la envía siempre la empresa desde Mercado Público.

Usa texto plano con títulos cortos en negrita (**así**) y viñetas con "- ". Máximo unas 250 palabras.`;

const formatoCLP = (n?: number) =>
  n && n > 0 ? new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n) : "No informado";

function describirLicitacion(l: Licitacion): string {
  return [
    `Código: ${l.id}`,
    `Título: ${l.titulo}`,
    `Organismo comprador: ${l.organismo || "No informado"}`,
    `Monto estimado: ${formatoCLP(l.montoEstimado)}`,
    `Tipo: ${l.categoria || "No informado"}`,
    `Estado: ${l.estado || "No informado"}`,
    `Publicación: ${l.fechaPublicacion || "No informada"}`,
    `Cierre de ofertas: ${l.fechaCierre || "No informado"}`,
    `Región: ${l.region || "No informada"}`,
    `Descripción: ${l.description || "Sin descripción"}`,
  ].join("\n");
}

function describirPerfil(p?: Perfil | null): string {
  if (!p || (!p.keywords?.length && !p.categorias?.length)) return "La empresa aún no configura su perfil de búsqueda.";
  return [
    `Palabras clave: ${p.keywords?.join(", ") || "—"}`,
    `Rubros: ${p.categorias?.join(", ") || "—"}`,
    `Regiones de interés: ${p.regiones?.join(", ") || "Todas"}`,
  ].join("\n");
}

const INSTRUCCION_RESUMEN = `Resume esta licitación para la empresa con estas secciones:
**En simple:** qué quiere comprar el organismo, en una o dos frases.
**Datos clave:** organismo, monto, cierre y tipo de licitación.
**¿Calza con tu empresa?:** compáralo con el perfil; si no hay perfil, dilo.
**Antes de postular revisa:** tres puntos concretos que debe verificar en las bases.
**Siguiente paso:** una acción concreta.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  // Solo usuarios autenticados (la anon key no tiene usuario)
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Inicia sesión para usar el Copiloto" }, 401);
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data: auth, error: authError } = await supabase.auth.getUser(token);
  if (authError || !auth?.user) return json({ error: "Inicia sesión para usar el Copiloto" }, 401);

  let body: { licitacion?: Licitacion; perfil?: Perfil; pregunta?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }

  const { licitacion, perfil } = body;
  const pregunta = body.pregunta?.trim();
  if (!licitacion && !pregunta) return json({ error: "Envía una licitación o una pregunta" }, 400);
  if (pregunta && pregunta.length > MAX_PREGUNTA) return json({ error: `La pregunta supera ${MAX_PREGUNTA} caracteres` }, 400);
  if (licitacion && (!licitacion.id || !licitacion.titulo)) return json({ error: "Licitación incompleta" }, 400);
  if (licitacion?.description && licitacion.description.length > MAX_DESCRIPCION) {
    return json({ error: "La descripción de la licitación es demasiado larga" }, 400);
  }

  const partes: string[] = [`<perfil_empresa>\n${describirPerfil(perfil)}\n</perfil_empresa>`];
  if (licitacion) partes.push(`<licitacion>\n${describirLicitacion(licitacion)}\n</licitacion>`);
  partes.push(pregunta ? `Pregunta del usuario: ${pregunta}` : INSTRUCCION_RESUMEN);

  const client = new Anthropic(); // lee ANTHROPIC_API_KEY del entorno

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      // Tarea corta y la usuaria espera en pantalla: esfuerzo bajo para responder rápido
      output_config: { effort: "low" },
      // Si el modelo declina por política, el servidor reintenta con el modelo de respaldo
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM,
      messages: [{ role: "user", content: partes.join("\n\n") }],
    });

    if (response.stop_reason === "refusal") {
      return json({ error: "El copiloto no pudo responder esa consulta. Prueba reformulándola." }, 422);
    }

    const texto = response.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    return json({ texto, modelo: response.model });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("ANTHROPIC_API_KEY inválida o ausente");
      return json({ error: "El copiloto no está configurado (API key)." }, 500);
    }
    if (error instanceof Anthropic.RateLimitError) {
      return json({ error: "Demasiadas consultas seguidas. Intenta en un minuto." }, 429);
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Anthropic ${error.status}:`, error.message);
      return json({ error: "El copiloto tuvo un problema. Intenta de nuevo." }, 502);
    }
    console.error(error);
    return json({ error: "Error inesperado" }, 500);
  }
});
