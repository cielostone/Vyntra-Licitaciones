// Identidad visual de la empresa: color de las cotizaciones, logo y firma.

export const COLOR_MARCA_DEFAULT = "#4F46E5"; // índigo Vyntra

export const COLORES_SUGERIDOS = [
  "#4F46E5", // índigo
  "#0EA5E9", // celeste
  "#059669", // verde
  "#D97706", // ámbar
  "#E11D48", // rosa
  "#7C3AED", // violeta
  "#0F172A", // grafito
];

export function esHexValido(hex?: string | null): hex is string {
  return !!hex && /^#[0-9a-f]{6}$/i.test(hex);
}

export function hexARgb(hex: string): [number, number, number] {
  const limpio = esHexValido(hex) ? hex : COLOR_MARCA_DEFAULT;
  const n = parseInt(limpio.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbAHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
}

// Luminancia relativa (WCAG): sobre colores claros el texto va oscuro
export function esColorClaro(hex: string): boolean {
  const [r, g, b] = hexARgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45;
}

// Color dominante de una lista de píxeles RGBA, ignorando transparentes,
// casi blancos, casi negros y grises (el fondo típico de un logo)
export function colorDominante(pixeles: Uint8ClampedArray): string | null {
  const cubetas = new Map<string, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i < pixeles.length; i += 4) {
    const [r, g, b, a] = [pixeles[i], pixeles[i + 1], pixeles[i + 2], pixeles[i + 3]];
    if (a < 128) continue;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max > 235 && min > 235) continue; // blanco
    if (max < 25) continue; // negro
    if (max - min < 30) continue; // gris
    const clave = `${r >> 5}-${g >> 5}-${b >> 5}`;
    const c = cubetas.get(clave) ?? { n: 0, r: 0, g: 0, b: 0 };
    c.n++;
    c.r += r;
    c.g += g;
    c.b += b;
    cubetas.set(clave, c);
  }
  let mejor: { n: number; r: number; g: number; b: number } | null = null;
  for (const c of cubetas.values()) if (!mejor || c.n > mejor.n) mejor = c;
  return mejor ? rgbAHex(mejor.r / mejor.n, mejor.g / mejor.n, mejor.b / mejor.n) : null;
}

const cargarImagen = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo leer la imagen"));
    img.src = src;
  });

const leerArchivo = (archivo: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(archivo);
  });

export const TAMANO_MAXIMO_ARCHIVO = 5 * 1024 * 1024; // 5 MB antes de reducir

// Reduce la imagen a un máximo de `lado` px y la devuelve como PNG en data URL,
// junto con su color dominante (para sugerir el color de las cotizaciones)
export async function prepararImagen(archivo: File, lado = 600): Promise<{ dataUrl: string; color: string | null }> {
  if (!archivo.type.startsWith("image/")) throw new Error("El archivo debe ser una imagen (PNG o JPG).");
  if (archivo.size > TAMANO_MAXIMO_ARCHIVO) throw new Error("La imagen pesa más de 5 MB.");

  const img = await cargarImagen(await leerArchivo(archivo));
  const escala = Math.min(1, lado / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.width * escala));
  canvas.height = Math.max(1, Math.round(img.height * escala));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Tu navegador no pudo procesar la imagen.");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const color = colorDominante(ctx.getImageData(0, 0, canvas.width, canvas.height).data);
  return { dataUrl: canvas.toDataURL("image/png"), color };
}
