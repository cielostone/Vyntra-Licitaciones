import { describe, expect, it } from "vitest";
import { colorDominante, esColorClaro, hexARgb, rgbAHex, COLOR_MARCA_DEFAULT } from "./marca";

const pixeles = (...colores: [number, number, number, number][]) => new Uint8ClampedArray(colores.flat());

describe("marca", () => {
  it("convierte hex y rgb ida y vuelta", () => {
    expect(hexARgb("#4F46E5")).toEqual([79, 70, 229]);
    expect(rgbAHex(79, 70, 229)).toBe("#4F46E5");
  });

  it("usa el color por defecto si el hex es inválido", () => {
    expect(hexARgb("rojo")).toEqual(hexARgb(COLOR_MARCA_DEFAULT));
  });

  it("detecta colores claros y oscuros", () => {
    expect(esColorClaro("#FDE68A")).toBe(true);
    expect(esColorClaro("#0F172A")).toBe(false);
    expect(esColorClaro("#4F46E5")).toBe(false);
  });

  it("encuentra el color del logo ignorando fondo blanco y transparente", () => {
    const blanco: [number, number, number, number] = [255, 255, 255, 255];
    const transparente: [number, number, number, number] = [0, 0, 0, 0];
    const rojo: [number, number, number, number] = [220, 20, 60, 255];
    const verde: [number, number, number, number] = [16, 185, 129, 255];
    const color = colorDominante(pixeles(blanco, blanco, blanco, transparente, rojo, rojo, rojo, verde));
    expect(color).toBe("#DC143C");
  });

  it("devuelve null si el logo no tiene color", () => {
    expect(colorDominante(pixeles([255, 255, 255, 255], [128, 128, 128, 255]))).toBeNull();
  });
});
