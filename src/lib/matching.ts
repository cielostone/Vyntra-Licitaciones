
import { Licitacion } from "@/data/licitaciones";

// Mock user profile - Ideally this would come from a user context or store
const userProfile = {
  keywords: ["tecnología", "software", "desarrollo", "infraestructura", "seguridad", "ciberseguridad", "transformación digital"],
  categories: ["Tecnología", "Consultoría", "Servicios"]
};

export const calculateMatchScore = (licitacion: Licitacion): number => {
  let score = 0;
  const maxScore = 100;
  
  // 1. Category Match (30 points)
  if (userProfile.categories.includes(licitacion.categoria)) {
    score += 30;
  }

  // 2. Keyword Matching in Title (40 points)
  const titleLower = licitacion.titulo.toLowerCase();
  const matchedKeywords = userProfile.keywords.filter(keyword => 
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
