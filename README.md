# Nexo CRM — Frontend

Interfaz responsive para gestionar clientes y ventas en un CRM SaaS. Incluye dashboard, empresas, contactos, oportunidades, tareas, actividad, perfil y asistente Gemini.

## Stack

- Next.js 16 (App Router), React 19 y TypeScript.
- CSS propio adaptable a móviles y escritorio.
- Route Handlers de Next.js como Backend for Frontend (BFF) para la API en Go.

## Ejecutar localmente

Requiere Node.js 20.9 o superior y el backend Go disponible.

```bash
npm install
npm run dev
```

Crea `.env.local` a partir de `.env.example` y configura la URL base del backend:

```env
BACKEND_API_URL=http://localhost:8080
```

La aplicación queda disponible en `http://localhost:3000`.

## Arquitectura y sesión

El App Router organiza las páginas públicas y el espacio autenticado; `src/features` contiene las funciones de producto y `src/lib/server` centraliza la integración de servidor. Los Route Handlers actúan como BFF entre el navegador y la API Go.

El token de sesión se guarda en una cookie `HttpOnly` y no se expone a JavaScript del navegador. El backend valida permisos y acceso a los datos.

## Funcionalidades

- Registro, inicio y cierre de sesión.
- Dashboard y operaciones CRUD para empresas, contactos, oportunidades y tareas.
- Búsqueda, filtros, exportación CSV e historial de actividad.
- Perfil de usuario y chat asistente contextual.
- Estados de carga y error, accesibilidad básica y diseño responsive.

## Comandos

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Despliegue en Vercel

Importa este repositorio en Vercel y, en **Settings → Environment Variables**, define `BACKEND_API_URL` con `https://crm-backend-05fc.onrender.com` para Production (y Preview si vas a probar previews). No agregues `/` al final ni `/api/v1`. Configura en el backend `FRONTEND_ORIGIN` con el dominio público que Vercel asigne al frontend para CORS.
