# Nexo CRM · Frontend

Frontend para el proyecto CRM SaaS, construido con Next.js App Router, React y TypeScript. Incluye un dashboard responsive, autenticación, y gestión de empresas, contactos, oportunidades y tareas.

## Stack

- Next.js 16 con App Router y React Server Components.
- React 19 y TypeScript en modo estricto.
- CSS responsive con variables de diseño, sin librería visual adicional.
- Route Handlers de Next.js como Backend for Frontend (BFF) para integrar la API Go.

## Ejecutar localmente

Requiere Node.js 20.9 o superior. Con el backend Go en ejecución:

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Abre `http://localhost:3000`. Configura `BACKEND_API_URL` en `.env.local` con el origen de la API Go (localmente `http://localhost:8080`). No uses una variable `NEXT_PUBLIC_` para la API; la URL solo se necesita en el servidor Next.

## Integración y sesión

El navegador habla con Route Handlers del mismo origen (`/api/auth/*`, `/api/session` y `/api/crm/*`). Estos se conectan desde servidor a Go. El token firmado por el backend se guarda en una cookie `HttpOnly`, `SameSite=Lax`, con `Secure` en producción. No se guarda en `localStorage` ni se expone a los componentes cliente.

La sesión se valida en el servidor cuando se renderiza el grupo privado `(workspace)`. Las solicitudes de datos pasan por el BFF y el backend vuelve a comprobar la organización y la membresía.

## Arquitectura

La aplicación combina convenciones del App Router con una organización por features:

```text
src/app/                 Rutas, layouts, estados de carga y Route Handlers
src/app/(auth)/          Login y registro
src/app/(workspace)/     Área privada y módulos del CRM
src/app/api/             BFF: sesión, auth y proxy de recursos CRM
src/components/          Componentes compartidos del workspace
src/features/auth/       Formularios y experiencia de autenticación
src/features/crm/        Gestión de recursos y formularios CRUD
src/lib/server/          Integración server-only con Go y sesión
src/types/               Contratos TypeScript del dominio
```

Responsabilidades relevantes:

- Las páginas del App Router recuperan los datos iniciales en servidor.
- Los componentes interactivos gestionan búsqueda local, formularios y estados de mutación.
- `ResourceManager` comparte la experiencia CRUD entre recursos mediante configuración de columnas y campos, manteniendo el contrato específico de cada entidad.
- Los Route Handlers centralizan la comunicación con Go y evitan repetir URL, cabeceras de autorización y tratamiento de errores en cada pantalla.
- Los contratos TypeScript reflejan las entidades del backend; el backend conserva la responsabilidad de validar datos y permisos.

## Funcionalidades

- Registro de usuario con creación de organización e inicio de sesión.
- Dashboard con métricas, valor del pipeline, oportunidades recientes y enfoque de tareas.
- Listado, creación, edición, eliminación y búsqueda en servidor para empresas, contactos, oportunidades y tareas.
- Filtros de oportunidades por etapa y tareas por estado.
- Exportación de contactos y oportunidades a CSV, respetando la búsqueda y la etapa seleccionada.
- Historial auditable de creaciones, actualizaciones y eliminaciones con filtros por tipo de registro y acción.
- Perfil de usuario con edición de nombre, sexo y fecha de nacimiento; el rol solo puede cambiarlo un administrador.
- Chat flotante del asistente Gemini contextual a dashboard, contactos, empresas, oportunidades, tareas y actividad.
- Selectores de relación para asociar contactos, oportunidades y tareas sin copiar UUID a mano.
- Formularios con validación de campos requeridos, feedback de carga, éxito y error.
- Diseño responsive, estados vacíos, navegación accesible y respeto por `prefers-reduced-motion`.
- Cabeceras básicas de seguridad configuradas en `next.config.ts`.

## Despliegue en Vercel

1. Importa el repositorio y define `frontend-saas` como **Root Directory**.
2. Configura `BACKEND_API_URL` con el origen público de Render, sin `/api/v1` al final.
3. Despliega con los comandos estándar de Next.js (`npm run build` y `npm run start`).
4. En Render define `FRONTEND_ORIGIN` con el dominio exacto publicado en Vercel para CORS.

## Comandos

```bash
npm run dev      # desarrollo
npm run lint     # ESLint
npm run build    # build de producción
npm run start    # servidor de producción local
```

## Siguientes mejoras

- Paginación de servidor, filtros remotos y ordenamiento.
- Formularios con validación de esquema compartida y pruebas de componentes/e2e.
- Refresh de sesión y manejo de expiración con renovación de token.
- OpenAPI generado desde el backend para compartir contratos entre Go y TypeScript.
