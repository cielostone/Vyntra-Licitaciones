import type { Licitacion } from "@/services/mercadoPublico";

// Perfil de búsqueda de la organización (tabla match_configs, se edita en Configuración)
export interface MatchProfile {
  keywords: string[];
  categorias: string[];
  regiones: string[];
  monto_minimo: number | null;
  monto_maximo: number | null;
}

export interface MatchResult {
  score: number; // 0–100
  reasons: string[]; // por qué calza (para el tooltip)
}

// Minúsculas y sin tildes, para que "tecnologia" calce con "Tecnología"
export const normalize = (s: string): string =>
  (s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

const isEmptyProfile = (p: MatchProfile) =>
  p.keywords.length === 0 && p.categorias.length === 0;

/**
 * Score 0–100 según el perfil real de la organización:
 *  - Palabras clave en título/descripción: hasta 50 (30 la primera, +10 c/u extra)
 *  - Rubros en título/descripción/categoría: 15
 *  - Región: 15 (si no hay regiones configuradas o es "Todas", cuenta como calce)
 *  - Monto dentro del rango: 15 (monto aún desconocido = 5)
 *  - Estado Abierta: 5
 * Devuelve null si el perfil está vacío (hay que configurarlo).
 */
export const calculateMatch = (
  licitacion: Licitacion,
  profile: MatchProfile | null,
): MatchResult | null => {
  if (!profile || isEmptyProfile(profile)) return null;

  let score = 0;
  const reasons: string[] = [];

  const titulo = normalize(licitacion.titulo);
  const texto = `${titulo} ${normalize(licitacion.description)} ${normalize(licitacion.categoria)}`;

  // 1. Palabras clave (50)
  const hits = profile.keywords.filter((k) => k && texto.includes(normalize(k)));
  if (hits.length > 0) {
    score += Math.min(30 + (hits.length - 1) * 10, 50);
    reasons.push(`Palabras clave: ${hits.slice(0, 3).join(", ")}`);
  }

  // 2. Rubros (15)
  const rubroHit = profile.categorias.find((c) => c && texto.includes(normalize(c)));
  if (rubroHit) {
    score += 15;
    reasons.push(`Rubro: ${rubroHit}`);
  }

  // 3. Región (15)
  const regiones = profile.regiones.map(normalize).filter(Boolean);
  const todas = regiones.length === 0 || regiones.includes("todas");
  const region = normalize(licitacion.region);
  if (todas) {
    score += 15;
  } else if (region && regiones.some((r) => region.includes(r) || r.includes(region))) {
    score += 15;
    reasons.push(`Región: ${licitacion.region}`);
  } else if (!region) {
    score += 5; // aún no se carga el detalle
  }

  // 4. Monto (15)
  const monto = licitacion.montoEstimado;
  const min = profile.monto_minimo ?? 0;
  const max = profile.monto_maximo ?? Infinity;
  if (!monto) {
    score += 5;
  } else if (monto >= min && monto <= max) {
    score += 15;
    reasons.push("Monto dentro de tu rango");
  }

  // 5. Estado (5)
  if (licitacion.estado === "Abierta") score += 5;

  // Sin calce de rubro ni palabra clave, no puede pasar de 35
  if (hits.length === 0 && !rubroHit) score = Math.min(score, 35);

  return { score: Math.min(score, 100), reasons };
};
