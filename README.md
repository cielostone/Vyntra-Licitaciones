# Vyntra Licitaciones 🚀

> Plataforma inteligente para la gestión y postulación de licitaciones públicas.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-18.x-61dafb.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.x-3178c6.svg)
![Vite](https://img.shields.io/badge/vite-5.x-646cff.svg)
![Tailwind](https://img.shields.io/badge/tailwind-3.x-38b2ac.svg)

**Vyntra Licitaciones** es una solución moderna diseñada para optimizar el flujo de trabajo de empresas que participan en Mercado Público. Ofrece herramientas avanzadas para filtrar oportunidades, gestionar borradores y generar documentación oficial automáticamente.

## ✨ Características Principales

*   **🔍 Búsqueda Inteligente**: Filtrado avanzado por estado, palabras clave y organismo.
*   **⭐ Gestión de Favoritos**: Marca licitaciones de interés para seguimiento rápido.
*   **📝 Borradores Persistentes**: Guarda tu progreso localmente y retoma tus postulaciones en cualquier momento.
*   **📊 Scoring de Coincidencia**: Algoritmo de *Match* que evalúa la relevancia de cada oportunidad según tu perfil.
*   **📄 Generación de PDF**: Crea cotizaciones formales en formato PDF con un solo clic, listas para adjuntar.
*   **⚡ Interfaz Moderna**: UI/UX optimizada con *shadcn/ui* para una experiencia fluida y responsive.

## 🛠️ Tecnologías

El proyecto está construido sobre un stack tecnológico robusto y moderno:

*   **[React 18](https://react.dev/)**: Biblioteca central para la interfaz de usuario.
*   **[TypeScript](https://www.typescriptlang.org/)**: Tipado estático para un código más seguro y mantenible.
*   **[Vite](https://vitejs.dev/)**: Build tool de próxima generación para un desarrollo ultrarrápido.
*   **[Tailwind CSS](https://tailwindcss.com/)**: Framework de utilidades para un diseño ágil y consistente.
*   **[shadcn/ui](https://ui.shadcn.com/)**: Componentes accesibles y personalizables.
*   **[TanStack Query](https://tanstack.com/query/latest)**: Gestión eficiente del estado del servidor.
*   **[jsPDF](https://artskydj.github.io/jsPDF/)**: Generación de documentos PDF en el cliente.

## 🚀 Instalación y Uso

Sigue estos pasos para desplegar el proyecto en tu entorno local:

### Prerrequisitos

*   Node.js (Versión LTS recomendada, ej. v18+)
*   npm o bun

### Pasos

1.  **Clonar el repositorio**
    ```bash
    git clone https://github.com/cielostone/Vyntra-Licitaciones.git
    cd Vyntra-Licitaciones
    ```

2.  **Instalar dependencias**
    ```bash
    npm install
    # o si usas bun
    bun install
    ```

3.  **Iniciar el servidor de desarrollo**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:8080` (o el puerto que asigne Vite).

4.  **Construir para producción**
    ```bash
    npm run build
    ```

## 📂 Estructura del Proyecto

```
src/
├── components/   # Componentes UI reutilizables (Botones, Inputs, Cards...)
├── context/      # Estado global (VyntraContext para persistencia)
├── data/         # Mock data y definiciones de tipos estáticos
├── hooks/        # Hooks personalizados (use-toast, etc.)
├── lib/          # Utilidades y lógica de negocio core (matching algorithm)
├── pages/        # Vistas principales (Oportunidades, Postulaciones, etc.)
└── App.tsx       # Configuración de rutas y providers
```

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Si deseas mejorar Vyntra Licitaciones:

1.  Haz un Fork del proyecto.
2.  Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`).
3.  Haz Commit de tus cambios (`git commit -m 'Add some AmazingFeature'`).
4.  Haz Push a la rama (`git push origin feature/AmazingFeature`).
5.  Abre un Pull Request.

---

Desarrollado con ❤️ para la comunidad de código abierto.
