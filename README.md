# Vyntra B2B SaaS Ecosystem 🚀

<p align="center">
  <img src="public/vyntra-logo.png" width="120" alt="Vyntra Logo">
</p>

> **Transformando la participación en Mercado Público con Inteligencia Artificial.**

[![Supabase](https://img.shields.io/badge/Database-Supabase-blueviolet?logo=supabase)](https://supabase.com/)
[![React](https://img.shields.io/badge/Frontend-React-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Build-Vite-646cff?logo=vite)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Styling-TailwindCSS-38b2ac?logo=tailwindcss)](https://tailwindcss.com/)

---

**Vyntra** no es solo un buscador de licitaciones; es un **Centro de Comando B2B** diseñado para empresas de alto rendimiento. Optimizamos todo el ciclo de vida de la postulación, desde el descubrimiento hasta la adjudicación, utilizando una interfaz premium y herramientas de productividad avanzada.

## 🧠 Características Principales (Fase 8+)

### ✨ Copiloto IA B2B
Un asistente estratégico integrado directamente en tu Dashboard. Diseñado para:
- Redactar resúmenes ejecutivos de bases técnicas.
- Analizar riesgos de cumplimiento en anexos.
- Sugerir oportunidades basadas en tu historial de éxito.

### 📅 Agenda Kanban Avanzada
Migramos la productividad a una vista completa (`/agenda`). 
- **Hitos Comerciales**: Gestiona recordatorios críticos de postulación.
- **Evidencia Digital**: Adjunta notas enriquecidas y fotografías/pantallazos de respaldo directamente en cada tarea.
- **Control de Tiempo**: Fechas límite con precisión de hora y minuto.

### 📊 Dashboard de Alto Impacto
Eliminamos el ruido visual por indicadores que realmente importan:
- **Win-Rate (Tasa de Éxito)**: Calcula tu eficacia comparando adjudicaciones reales vs propuestas enviadas.
- **Radar de Oportunidades**: Visualización limpia de licitaciones abiertas, adjudicadas y en proceso.

### 🔌 Sync con Mercado Público (Auto-Pilot)
- **Vínculo por RUT**: Sincronización automática de tu historial de proveedor.
- **Detección Automática**: Vyntra detecta si ganaste o perdiste un proceso y actualiza tus estados sin intervención manual.

### 📄 Generador Premium de Cotizaciones
- Generación instantánea de PDFs con **identidad corporativa** (Logo y Firma).
- Plantillas con diseño profesional B2B listas para anexar al portal.

---

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Vite.
- **UI/UX**: Tailwind CSS + shadcn/ui + Lucide Icons.
- **Backend & Auth**: Supabase (PostgreSQL + RLS + Auth).
- **Documentación**: jsPDF para la exportación de cotizaciones.

## 🚀 Instalación y Desarrollo Local

1.  **Clonar repositorio**:
    ```bash
    git clone https://github.com/cielostone/Vyntra-Licitaciones.git
    ```
2.  **Instalar dependencias**:
    ```bash
    npm install
    ```
3.  **Configurar variables de entorno**:
    Crea un archivo `.env` con tus credenciales de **Supabase**:
    ```env
    VITE_SUPABASE_URL=tu_url
    VITE_SUPABASE_ANON_KEY=tu_key
    ```
4.  **Iniciar servidor**:
    ```bash
    npm run dev
    ```

---

<p align="center">
  Hecho con ❤️ por el equipo de <strong>Vyntra Tecnologías</strong>
</p>
