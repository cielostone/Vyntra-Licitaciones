# 🏗️ AGENCY.md — Vyntra Licitaciones

> **Documento de referencia técnica y estratégica para el equipo de desarrollo.**
> Actualizado: Marzo 2026

---

## 📌 ¿Qué es Vyntra Licitaciones?

**Vyntra Licitaciones** es un **SaaS B2B** para el mercado chileno que permite a empresas y profesionales independientes:

1. **Descubrir** licitaciones públicas relevantes de Mercado Público (mercadopublico.cl)
2. **Evaluar** su nivel de match con cada oportunidad mediante un algoritmo de scoring
3. **Postular** generando cotizaciones PDF profesionales
4. **Gestionar** su pipeline de licitaciones (favoritos, borradores, adjudicadas)

**Mercado objetivo:** Proveedores registrados en Mercado Público — más de 100,000 empresas en Chile.

---

## 💰 Modelo de Negocio

### Planes de Suscripción (CLP / mes)

| Plan | Precio | Target | Límites |
|---|---|---|---|
| **Free** | $0 | Exploradores | 3 favoritos, borradores básicos |
| **Pro** | $29.990 | Profesionales independientes | Favoritos ilimitados, PDF, alertas email |
| **Enterprise** | $79.990 | Equipos de licitaciones (3+ usuarios) | Multi-usuario, IA avanzada, API |

**Pasarela de pago objetivo:** Transbank WebPay (mercado local) + Stripe como alternativa.

---

## 🏛️ Arquitectura

### Stack Tecnológico

```
Frontend:  React 18 + TypeScript + Vite
UI:        shadcn/ui + Tailwind CSS 3
Estado:    TanStack Query (server) + Context API (local)
Router:    React Router v6
PDF:       jsPDF + jsPDF-autotable
Backend:   Supabase (Auth + PostgreSQL + Storage + Edge Functions)
Fuente:    API Mercado Público → https://api.mercadopublico.cl
```

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────┐
│           Frontend (React/Vite)         │
│  Dashboard │ Oportunidades │ Postular   │
└─────────────────┬───────────────────────┘
                  │ HTTPS
        ┌─────────▼──────────┐
        │      Supabase      │
        │  ┌──────────────┐  │
        │  │ Auth (JWT)   │  │
        │  └──────────────┘  │
        │  ┌──────────────┐  │
        │  │  PostgreSQL  │  │  ← Multitenant con RLS
        │  │  (RLS por    │  │
        │  │  org_id)     │  │
        │  └──────────────┘  │
        │  ┌──────────────┐  │
        │  │Edge Functions│  │  ← Sync Mercado Público
        │  └──────────────┘  │
        └────────────────────┘
                  │
        ┌─────────▼──────────┐
        │  API Mercado       │
        │  Público (cache)   │
        └────────────────────┘
```

---

## 🗄️ Base de Datos — Modelo Multitenant

### Modelo elegido: **Shared DB + `organization_id` como tenant key**

Cada empresa/profesional es un **tenant** (`organizations`). Todas las tablas de datos de usuario incluyen `organization_id`. La seguridad se garantiza mediante **Row Level Security (RLS)** de PostgreSQL.

### Tablas y responsabilidades

| Tabla | Descripción | Tier |
|---|---|---|
| `organizations` | El tenant (empresa/profesional) | Tenant root |
| `profiles` | Usuarios con `organization_id` | Por org |
| `licitaciones` | Cache de Mercado Público | **Global** (sin tenant) |
| `favorites` | Favoritos por usuario/org | Por org |
| `drafts` | Borradores de postulación | Por org |
| `subscriptions` | Historial de pagos/plan | Por org |
| `notification_configs` | Configuración de alertas | Por usuario/org |
| `match_configs` | Perfil de matching/keywords | Por org |

### ⚠️ Regla crítica de RLS
> Todo `INSERT`, `SELECT`, `UPDATE`, `DELETE` sobre datos de usuario debe filtrar por `organization_id = (select organization_id from profiles where id = auth.uid())`.

---

## 🔑 Variables de Entorno

Copia `.env.example` a `.env` y completa:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

Estas credenciales las encuentras en: **Supabase Dashboard → Settings → API**

---

## 🗺️ Roadmap

### ✅ Fase 0 — Fundación (Completado en código, pendiente en infra)
- [x] UI completa (Dashboard, Oportunidades, Postular, Suscripción, Configuración)
- [x] Auth con perfiles extendidos (RUT, tipo persona)
- [x] Match Score básico
- [x] Generación de PDF
- [x] Planes de suscripción (UI)
- [ ] **Crear proyecto Supabase nuevo** ← BLOQUEANTE
- [ ] **Correr `supabase_multitenant_schema.sql`**
- [ ] **Configurar `.env`**

### 🟡 Fase 1 — MVP Funcional (v0.1)
- [ ] Conectar datos reales desde API Mercado Público
  - Endpoint: `https://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json?ticket=API_KEY`
  - Supabase Edge Function que sincroniza cada 6 horas
- [ ] Guard de rutas (redirect a `/login` si no hay sesión activa)
- [ ] Conectar página Configuración al perfil real del usuario
- [ ] Enforcement de límites de plan en backend (no solo localStorage)
  - Tabla `subscriptions` como fuente de verdad

### 🟢 Fase 2 — Monetización (v0.2)
- [ ] Integración Transbank WebPay (pago local Chilean standard)
- [ ] Webhook de Transbank → actualiza `organizations.plan`
- [ ] Sistema de alertas por email
  - Supabase Edge Functions + Resend (API de email moderna)
  - Cron: revisar licitaciones que cierran en 48h → enviar email a configs activas
- [ ] Multi-usuario por organización (invitaciones por email)
- [ ] Tabla `match_configs` conectada al scoring real

### 🔵 Fase 3 — IA y Diferenciación (v0.3)
- [ ] Match Score mejorado con `match_configs` por organización
- [ ] Integración OpenAI / Claude para análisis de licitación:
  - Resumen de requisitos
  - Detección de riesgos ("requiere boleta de garantía", "exige experiencia previa")
  - Estimación de margen
- [ ] Alertas inteligentes: solo licitaciones con match > umbral del usuario
- [ ] Análisis de competidores (datos históricos de adjudicación pública disponibles en API)

### ⚪ Fase 4 — Escala (v1.0)
- [ ] Dashboard de administración (backoffice interno)
- [ ] API pública para plan Enterprise
- [ ] Integración con firma electrónica (para adjuntar documentos firmados)
- [ ] App móvil (React Native o PWA)

---

## 📁 Estructura del Proyecto

```
/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── AppSidebar.tsx
│   │   ├── Layout.tsx
│   │   └── StatCard.tsx
│   ├── context/
│   │   └── VyntraContext.tsx  # Estado global (favoritos, borradores, plan)
│   ├── contexts/
│   │   └── AuthContext.tsx    # Sesión de usuario
│   ├── data/
│   │   └── licitaciones.ts    # Mock data (temporal hasta Fase 1)
│   ├── hooks/
│   │   └── useLicitaciones.ts # Hook para datos de licitaciones
│   ├── integrations/
│   │   └── supabase/
│   │       └── client.ts      # Cliente Supabase
│   ├── lib/
│   │   └── matching.ts        # Algoritmo de Match Score
│   └── pages/
│       ├── Dashboard.tsx
│       ├── Login.tsx
│       ├── Oportunidades.tsx
│       ├── Postulaciones.tsx
│       ├── NuevaPostulacion.tsx
│       ├── Suscripcion.tsx
│       └── Configuracion.tsx
│
├── supabase_multitenant_schema.sql  # ← Schema completo listo para correr
├── .env.example
├── AGENCY.md                        # ← Este archivo
└── README.md
```

---

## 🚀 Setup Local (paso a paso)

```bash
# 1. Asegúrate de usar Node >= 18
nvm use 20

# 2. Instalar dependencias
npm install --legacy-peer-deps

# 3. Copiar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# 4. En Supabase: SQL Editor → pegar y ejecutar supabase_multitenant_schema.sql

# 5. Levantar dev server
npm run dev
# → http://localhost:8080
```

---

## 🔗 APIs Externas

### API Mercado Público
- **Docs:** https://www.mercadopublico.cl/ProductosyServicios/Productos/ApismpPublic
- **Requiere:** API Key (gratis, solicitar en ChileCompra)
- **Endpoint licitaciones activas:**
  ```
  GET https://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json
    ?ticket={API_KEY}&estado=activas&fecha={YYYYMMDD}
  ```
- **Estrategia de cache:** Supabase Edge Function con cron (cada 6 horas)

### Transbank WebPay (billing)
- **SDK:** `transbank-sdk` (npm)
- **Docs:** https://www.transbankdevelopers.cl

### Resend (emails transaccionales)
- **Docs:** https://resend.com/docs
- **Precios:** 3,000 emails/mes gratis

---

## 📐 Decisiones Técnicas Clave

### ¿Por qué multitenancy por `organization_id` y no schemas separados?
- Supabase no soporta bien schemas dinámicos por tenant
- RLS de PostgreSQL es suficientemente robusto para aislar datos
- Más simple de operar y mantener en early-stage
- Se puede migrar a schemas separados si algún Enterprise lo requiere

### ¿Por qué `licitaciones` no tiene `organization_id`?
- Las licitaciones son datos **públicos** de Mercado Público
- Todos los tenants ven las mismas licitaciones
- Solo los favoritos, drafts y configuraciones son por-tenant

### ¿Por qué Supabase y no backend propio?
- Auth, RLS y Edge Functions cubren el 90% de las necesidades del MVP
- Menor time-to-market
- Se puede migrar a un backend Node.js/NestJS si escala

---

*Documento mantenido por el equipo de desarrollo de Vyntra.*
