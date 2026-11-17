// ============================================================
// Servicio de integración con API Mercado Público Chile
// Docs: https://api.mercadopublico.cl
// ============================================================

const TICKET = import.meta.env.VITE_MERCADO_PUBLICO_TICKET;
const BASE_URL = "https://api.mercadopublico.cl/servicios/v1/publico";

// Mapeo de CodigoEstado (número) → label legible
// La API retorna números como: 5=Publicada, 6=Cerrada, 7=Desierta, 8=Adjudicada, etc.
const ESTADO_MAP: Record<number, string> = {
  5:  "Abierta",
  6:  "Por Cerrar",
  7:  "Cerrada",
  8:  "Adjudicada",
  16: "Desierta",
  18: "Revocada",
};

function mapEstado(codigoEstado: number): string {
  return ESTADO_MAP[codigoEstado] ?? "Abierta";
}

// Inferir categoría desde el sufijo del código de licitación (ej: LE26, LP26, LR26)
function inferCategoria(codigoExterno: string): string {
  const partes = codigoExterno.split("-");
  const sufijo = partes[partes.length - 1]?.slice(0, 2).toUpperCase() ?? "";
  const categorias: Record<string, string> = {
    LE: "LE — Licitación Pública pequeña",
    LP: "LP — Licitación Pública",
    LR: "LR — Licitación Privada",
    CO: "CO — Compra Directa",
    L1: "L1 — Trato Directo",
    L2: "L2 — Trato Directo",
    E2: "E2 — Trato Directo",
    B2: "B2 — Convenio Marco",
    O1: "O1 — Obra Pública",
    I2: "I2 — Concesión",
  };
  return categorias[sufijo] ?? "General";
}

// Obtiene el código de organismo del código de licitación (primer segmento)
function getCodigoOrganismo(codigoExterno: string): string {
  return codigoExterno.split("-")[0] ?? "";
}

// ─────────────────────────────────────────────
// Tipos que devuelve la API en el LISTADO
// (El listado solo retorna campos básicos)
// ─────────────────────────────────────────────
export interface MpLicitacionListado {
  CodigoExterno: string;
  Nombre: string;
  CodigoEstado: number;
  FechaCierre: string | null;
}

// ─────────────────────────────────────────────
// Tipo interno de la app
// ─────────────────────────────────────────────
export interface Licitacion {
  id: string;
  titulo: string;
  organismo: string;
  montoEstimado: number;
  fechaCierre: string;
  fechaPublicacion: string;
  estado: string;
  categoria: string;
  region: string;
  description: string;
  fuente_url: string;
}

// ─────────────────────────────────────────────
// Mapear respuesta del LISTADO → tipo interno
// Nota: Organismo y Monto NO están en el listado,
// se obtienen con fetchLicitacionPorCodigo()
// ─────────────────────────────────────────────
function mapLicitacionListado(mp: MpLicitacionListado): Licitacion {
  const codigoOrg = getCodigoOrganismo(mp.CodigoExterno);
  return {
    id:               mp.CodigoExterno,
    titulo:           mp.Nombre,
    organismo:        `Org. ${codigoOrg}`,
    montoEstimado:    0,
    fechaCierre:      mp.FechaCierre ? mp.FechaCierre.split("T")[0] : "",
    fechaPublicacion: "",
    estado:           mapEstado(mp.CodigoEstado),
    categoria:        inferCategoria(mp.CodigoExterno),
    region:           "",
    description:      mp.Nombre,
    fuente_url:       `https://www.mercadopublico.cl/Procurement/Modules/RFB/DetailsAcquisition.aspx?idlicitacion=${encodeURIComponent(mp.CodigoExterno)}`,
  };
}

// ─────────────────────────────────────────────
// Obtener licitaciones activas (listado)
// ─────────────────────────────────────────────
export async function fetchLicitacionesActivas(): Promise<Licitacion[]> {
  if (!TICKET) throw new Error("VITE_MERCADO_PUBLICO_TICKET no está configurado en .env");

  const url = `${BASE_URL}/licitaciones.json?estado=activas&ticket=${TICKET}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Error API Mercado Público: ${response.status}`);

  const json = await response.json();
  const listado: MpLicitacionListado[] = json?.Listado ?? [];
  return listado.map(mapLicitacionListado);
}

// ─────────────────────────────────────────────
// Obtener licitaciones por fecha (DDMMYYYY)
// ─────────────────────────────────────────────
export async function fetchLicitacionesPorFecha(fecha: Date): Promise<Licitacion[]> {
  if (!TICKET) throw new Error("VITE_MERCADO_PUBLICO_TICKET no está configurado");

  const dd   = String(fecha.getDate()).padStart(2, "0");
  const mm   = String(fecha.getMonth() + 1).padStart(2, "0");
  const yyyy = fecha.getFullYear();

  const url = `${BASE_URL}/licitaciones.json?fecha=${dd}${mm}${yyyy}&ticket=${TICKET}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Error API: ${response.status}`);

  const json = await response.json();
  return (json?.Listado ?? []).map(mapLicitacionListado);
}

// ─────────────────────────────────────────────
// Obtener DETALLE de una licitación por código
// Este endpoint SÍ retorna Organismo, Monto, Descripción
// ─────────────────────────────────────────────
export async function fetchLicitacionPorCodigo(codigo: string): Promise<Licitacion | null> {
  if (!TICKET) throw new Error("VITE_MERCADO_PUBLICO_TICKET no está configurado");

  const url = `${BASE_URL}/licitaciones.json?codigo=${codigo}&ticket=${TICKET}`;
  // La API responde 429 si hay muchas consultas simultáneas: reintentar con espera creciente
  let response = await fetch(url);
  for (const espera of [800, 2000, 4000]) {
    if (response.status !== 429) break;
    await new Promise((r) => setTimeout(r, espera));
    response = await fetch(url);
  }
  if (!response.ok) return null;

  const json = await response.json();
  const items: any[] = json?.Listado ?? [];
  if (items.length === 0) return null;

  const item = items[0];
  // En el detalle las fechas vienen dentro de item.Fechas
  const cierre = item.Fechas?.FechaCierre ?? item.FechaCierre;
  const publicacion = item.Fechas?.FechaPublicacion ?? item.FechaPublicacion;
  return {
    id:               item.CodigoExterno,
    titulo:           item.Nombre,
    organismo:        item.Comprador?.NombreOrganismo
                      ?? item.Comprador?.NombreUnidad
                      ?? `Org. ${getCodigoOrganismo(item.CodigoExterno)}`,
    montoEstimado:    item.MontoEstimado ?? 0,
    fechaCierre:      cierre ? cierre.split("T")[0] : "",
    fechaPublicacion: publicacion ? publicacion.split("T")[0] : "",
    estado:           mapEstado(item.CodigoEstado),
    categoria:        item.Tipo ?? inferCategoria(item.CodigoExterno),
    region:           item.Comprador?.RegionUnidad ?? "",
    description:      item.Descripcion ?? item.Nombre,
    fuente_url:       `https://www.mercadopublico.cl/Procurement/Modules/RFB/DetailsAcquisition.aspx?idlicitacion=${encodeURIComponent(item.CodigoExterno)}`,
  };
}

// ─────────────────────────────────────────────
// Obtener historial de licitaciones por RUT Proveedor
// Permite extraer el radar de antecedentes de la empresa
// ─────────────────────────────────────────────
export async function fetchLicitacionesPorRut(rutProveedor: string): Promise<Licitacion[]> {
  if (!TICKET) throw new Error("VITE_MERCADO_PUBLICO_TICKET no está configurado");

  // El RUT en MP debe ir sin puntos y con guion. Ej: 76123456-K
  const cleanRut = rutProveedor.replace(/\./g, "").toUpperCase();
  const url = `${BASE_URL}/licitaciones.json?rutproveedor=${cleanRut}&ticket=${TICKET}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Error API MP Proveedor: ${response.status}`);

  const json = await response.json();
  return (json?.Listado ?? []).map(mapLicitacionListado);
}
