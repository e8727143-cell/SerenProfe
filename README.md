# SerenProfe - Tu Asistente Pedagógico

Este proyecto es una aplicación web moderna construida con React, Vite y Tailwind CSS, diseñada para ayudar a los docentes a generar planeaciones didácticas utilizando Inteligencia Artificial (Google Gemini).

## Despliegue en Vercel

La aplicación está totalmente optimizada para ser desplegada en [Vercel](https://vercel.com). Sigue estos pasos:

1.  **Sube tu código a GitHub/GitLab/Bitbucket.**
2.  **Importa el proyecto en Vercel.**
3.  **Configuración del Proyecto:**
    *   **Framework Preset:** Vite (Vercel debería detectarlo automáticamente).
    *   **Root Directory:** `./` (la raíz del repositorio).
    *   **Build Command:** `npm run build` (o `vite build`).
    *   **Output Directory:** `dist`.

4.  **Variables de Entorno (Environment Variables):**
    Es CRUCIAL que configures las siguientes variables en el panel de Vercel (Settings > Environment Variables) para que la app funcione:

    *   `VITE_SUPABASE_URL`: Tu URL de proyecto de Supabase.
    *   `VITE_SUPABASE_ANON_KEY`: Tu clave pública (anon key) de Supabase.

    > **Nota:** La clave de Gemini API (`GEMINI_API_KEY`) **NO** se necesita en el frontend de Vercel porque la aplicación la gestiona de forma segura a través de la base de datos de Supabase (tabla `api_keys`) y las funciones del backend, o bien, si estás usando la integración directa en el cliente (como en la versión actual de `gemini.ts`), asegúrate de revisar cómo se está obteniendo.
    >
    > *En la versión actual del código (`src/lib/gemini.ts`), la API Key se obtiene dinámicamente desde la tabla `api_keys` de Supabase para permitir la rotación de claves. Por lo tanto, no necesitas poner la `GEMINI_API_KEY` en Vercel, pero SÍ necesitas asegurarte de que tu tabla `api_keys` en Supabase tenga claves válidas.*

5.  **Desplegar:** Haz clic en "Deploy".

## Características

*   **Generación con IA:** Crea planeaciones detalladas o prácticas.
*   **Modo Supervivencia:** Elige entre "Práctico (Aula)" o "Inspección (Detallado)".
*   **Inclusión:** Adaptaciones curriculares para TDAH, Autismo, etc.
*   **Historial:** Guarda y recupera tus planeaciones anteriores.
*   **Exportación:** Descarga en PDF, Word o Texto.
*   **Seguridad:** Acceso restringido por correo electrónico (White List).

## Tecnologías

*   React 18
*   Vite
*   Tailwind CSS
*   Supabase (Base de datos y Auth)
*   Google Gemini AI (Generación de contenido)
*   Lucide React (Iconos)
*   Framer Motion (Animaciones)
