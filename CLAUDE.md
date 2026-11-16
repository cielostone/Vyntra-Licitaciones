# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

SaaS B2B para descubrir y postular a licitaciones públicas chilenas via la API de Mercado Público (mercadopublico.cl). Frontend-only con Supabase como backend.

## Commands

```bash
npm run dev          # desarrollo local
npm run build        # build de producción
npm run test         # vitest (run once)
npm run test:watch   # vitest en modo watch
npm run lint         # ESLint
```

Para correr un test específico: `npx vitest run src/path/to/file.test.ts`

## Variables de entorno requeridas

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_MERCADO_PUBLICO_TICKET   # ticket API de mercadopublico.cl
```

## Arquitectura

### Flujo de datos principal

1. `useLicitaciones` (hook) llama a `fetchLicitacionesActivas()` al montar → guarda en estado local + caché `localStorage`
2. El listado solo trae campos básicos (`titulo`, `estado`, `fechaCierre`). `organismo`, `montoEstimado`, `descripcion` y `region` llegan solo con `fetchLicitacionPorCodigo()`
3. `prefetchDetalles()` enriquece en background los registros visibles, en lotes de 5 con 200ms de pausa para no saturar la API
4. `enrichLicitacion()` actualiza el estado sin refetch cuando el Drawer carga el detalle individual

### Estado global

- **`AuthContext`** (`src/contexts/`) — sesión Supabase, login/logout/signup
- **`VyntraContext`** (`src/context/`) — favoritos, borradores de postulaciones y plan de suscripción; todo persiste en `localStorage`

### Reglas de negocio clave

- Plan Free: máximo 3 favoritos. El gate está en `VyntraContext.toggleFavorite` y en la UI de `Oportunidades`
- Match score (0–100) calculado en `src/lib/matching.ts` (`calculateMatch`) con el perfil real de la organización (tabla `match_configs`, editable en Configuración, leída por `useMatchProfile`): keywords (hasta 50) + rubros (15) + región (15) + monto en rango (15) + Abierta (5). Sin perfil devuelve `null` y la UI muestra "—". Oportunidades ordena por score
- Códigos de estado Mercado Público: 5=Abierta, 6=Por Cerrar, 7=Cerrada, 8=Adjudicada, 16=Desierta, 18=Revocada
- Tipo de licitación se infiere del sufijo del código (ej: `LE`, `LP`, `LR`, `CO`)

### Rutas

Definidas en `src/App.tsx`. Rutas protegidas via `<PrivateRoute>` que verifica sesión Supabase.

### Componentes shadcn/ui

Están en `src/components/ui/` — son generados, no editarlos directamente. Para agregar nuevos: `npx shadcn@latest add <component>`.

## Convenciones

- Path alias `@/` apunta a `src/`
- Formularios: React Hook Form + Zod. Definir el schema Zod primero, luego inferir el tipo con `z.infer<>`
- No hay Redux ni Zustand — todo el estado global va en los dos contextos existentes
