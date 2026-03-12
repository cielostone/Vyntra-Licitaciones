
import { Licitacion } from "@/services/mercadoPublico";

// Default mock profile for fallback until we implement profile preferences in DB
const defaultProfile = {
  keywords: ["tecnología", "software", "desarrollo", "infraestructura", "seguridad", "ciberseguridad", "transformación digital"],
  categories: ["Tecnología", "Consultoría", "Servicios"]
};

export const calculateMatchScore = (licitacion: Licitacion, userProfile: any = defaultProfile): number => {
  let score = 0;
  const maxScore = 100;

  const profile = userProfile || defaultProfile;
  const keywords = profile.keywords || [];
  const categories = profile.categories || [];

  // 1. Category Match (30 points)
  if (categories.includes(licitacion.categoria)) {
    score += 30;
  }

  // 2. Keyword Matching in Title (40 points)
  const titleLower = licitacion.titulo.toLowerCase();
  const matchedKeywords = keywords.filter((keyword: string) =>
    titleLower.includes(keyword.toLowerCase())
  );

  // Add points for each keyword found, up to 40
  score += Math.min(matchedKeywords.length * 15, 40);

  // 3. Status Bonus (10 points)
  if (licitacion.estado === "Abierta") {
    score += 10;
  }

  // 4. Budget Fit (Mock Logic - 20 points)
  // Assuming user prefers projects > 10M
  if (licitacion.montoEstimado > 10000000) {
    score += 20;
  }

  return Math.min(score, maxScore);
};
