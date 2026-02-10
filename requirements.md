# Documento de Requerimientos - Vyntra

## 1. Introducción y Visión
**Vyntra** es un ecosistema SaaS (Software as a Service) diseñado para automatizar el ciclo completo de participación en el portal de Mercado Público de Chile.
A diferencia de las plataformas actuales que solo actúan como buscadores, Vyntra utiliza **IA Generativa** para analizar bases legales y **RPA (Robotic Process Automation)** para la ejecución de ofertas económicas sin intervención humana manual.

## 2. El Problema y la Oportunidad
*   **Problema:** Un proveedor promedio gasta 12 horas semanales buscando licitaciones, leyendo PDFs de bases administrativas y cargando ofertas en un portal web lento.

## 3. Análisis de Requerimientos Detallado

### 3.1 Requerimientos Funcionales (RF)

#### A. Módulo de Ingesta e Inteligencia (Radar)
*   **RF.A.1:** Extracción periódica (cada 15 min) de licitaciones y Compra Ágil vía API/Scraping.
*   **RF.A.2:** Procesamiento de archivos adjuntos (PDF/Word) mediante OCR e IA para extraer cláusulas críticas (boletas de garantía, multas, plazos de entrega).
*   **RF.A.3:** Algoritmo de *Match Scoring* que califica la licitación del 1 al 100 según el historial y keywords del usuario.

#### B. Módulo de Ejecución (Action Engine)
*   **RF.B.1:** Generador de Cotizaciones: Creación automática de un documento PDF con el logo del usuario, desglose de ítems, IVA y validez de la oferta.
*   **RF.B.2:** Bot RPA de Postulación: Navegación autónoma en mercadopublico.cl, ingreso de montos por ítem y carga de archivos generados.

#### C. Módulo Financiero y de Gestión (Dashboard)
*   **RF.C.1:** Cálculo y visualización de IVA por licitación y acumulado mensual.
*   **RF.C.2:** Análisis de recaudación y flujo de caja mensual.
*   **RF.C.3:** Identificación de licitaciones con mayor tasa de postulación.
*   **RF.C.4:** Establecimiento y seguimiento de metas de flujo para el mes siguiente.
*   **RF.C.5:** Inceptivos gamificados: Mascota virtual que evoluciona baseada en el cumplimiento de metas de adjudicación.
