import { describe, it, expect } from "vitest";
import { calculateMatch, type MatchProfile } from "./matching";
import type { Licitacion } from "@/services/mercadoPublico";

const lic = (over: Partial<Licitacion> = {}): Licitacion => ({
  id: "1234-5-LE26",
  titulo: "Adquisición de uniformes y textiles para personal",
  organismo: "Municipalidad",
  montoEstimado: 0,
  fechaCierre: "",
  fechaPublicacion: "",
  estado: "Abierta",
  categoria: "LE — Licitación Pública pequeña",
  region: "",
  description: "",
  fuente_url: "",
  ...over,
});

const perfil: MatchProfile = {
  keywords: ["uniformes", "textil"],
  categorias: ["Vestuario"],
  regiones: ["Metropolitana"],
  monto_minimo: 1_000_000,
  monto_maximo: 20_000_000,
};

describe("calculateMatch", () => {
  it("devuelve null sin perfil configurado", () => {
    expect(calculateMatch(lic(), null)).toBeNull();
    expect(calculateMatch(lic(), { ...perfil, keywords: [], categorias: [] })).toBeNull();
  });

  it("puntúa alto cuando calzan palabras clave, región y monto (sin importar tildes)", () => {
    const r = calculateMatch(
      lic({ region: "Región Metropolitana de Santiago", montoEstimado: 5_000_000 }),
      { ...perfil, keywords: ["UNIFÓRMES", "textil"] },
    )!;
    expect(r.score).toBeGreaterThanOrEqual(75);
    expect(r.reasons.join(" ")).toContain("Región");
  });

  it("puntúa bajo cuando no calza el rubro", () => {
    const r = calculateMatch(lic({ titulo: "Construcción de puente" }), perfil)!;
    expect(r.score).toBeLessThanOrEqual(35);
  });
});
