# Revisión de buenas prácticas React 19 / Next.js 16 — App Router (layout, rutas, proxy y config)

- Fecha: 2026-10-01
- Objetivo: `app/layout.tsx`, `app/page.tsx`, `app/(auth)/layout.tsx`, `app/(auth)/{login,register,verify-account,forgot-password,reset-password}/page.tsx`, `app/(dashboard)/layout.tsx`, `app/(dashboard)/dashboard/page.tsx`, `proxy.ts`, `next.config.ts`, `app/globals.css`
- Stack verificado: Next.js **16.3.7** (App Router, Turbopack) + React **19.2.8** + TypeScript strict + Tailwind CSS v4 (`@theme inline`, sin `tailwind.config.*`)
- Referencias:
  - Docs locales de la versión instalada: `node_modules/next/dist/docs/01-app/...` (fuente de verdad para 16.3.7)
  - Context7: `/vercel/next.js/v16.2.9` (generate-metadata, generate-viewport, error/loading/not-found, version-16 upgrade, layouts-and-pages) y `/tailwindlabs/tailwindcss.com` (`@theme inline`, keyframes)
  - Verificación en ejecución: `next dev` (PID 25783, puerto 3000) + Playwright MCP
  - Comandos: `pnpm lint` ✅, `pnpm exec tsc --noEmit` ✅, `pnpm exec next typegen` ✅

## Resumen ejecutivo

La base está **muy bien**: no hay errores de arquitectura de App Router, la frontera Server/Client es correcta en todos los archivos revisados, el tipado de props de ruta (`LayoutProps`/`PageProps`) es válido y `proxy.ts` ya usa la convención nueva de Next 16 (`middleware` → `proxy`).

- **Incumplimientos (severidad alta): 0**
- **Hallazgos media: 4** — 2 aplicados, 2 descritos como recomendación (cambian `<title>`/estructura de redirect)
- **Hallazgos baja: 10** — descritos como recomendación
- **Estado: corregido** (los dos cambios aplicados se verificaron en el navegador contra el dev server)

Nota de precisión: la documentación indexada en Context7 para `error.js`/`global-error.js` muestra `unstable_retry`, pero la guía local de 16.3.7 documenta `retry` como prop estable desde `v16.3.0` (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md:331`). Manda la doc local.

## Hallazgos

### `app/layout.tsx`

| # | Severidad | Evidencia (línea/código) | Problema | Recomendación / cambio |
| --- | --- | --- | --- | --- |
| 1 | Media | `app/layout.tsx:13-17` (bloque `metadata`) | No se exporta `viewport`; `themeColor` no puede ir en `metadata` desde Next 15 (existe el codemod `metadata-to-viewport-export`). Sin `theme-color`, la barra del navegador/móvil no coincide con el fondo real de la app. | **Aplicado**: `export const viewport: Viewport = { themeColor: "#030712" }` (mismo valor que `--background` en `app/globals.css:26`). Evidencia Context7: *Migrate Viewport Metadata to viewport Export* + doc local `04-functions/generate-viewport.md:21-33`. Verificado en el navegador: `<meta name="theme-color" content="#030712">` y el `viewport` por defecto sigue presente (`width=device-width, initial-scale=1`). |
| 2 | Media | `app/layout.tsx:13-17` | Faltan `metadataBase` y metadatos sociales (`openGraph`/`twitter`). Además el `title` es un string plano que duplica la marca con los títulos hijos (`"Iniciar sesión — Tensi"`, `"Dashboard — Tensi"`). | **No aplicado (recomendación)**: añadir `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!)` (hoy solo existe `NEXT_PUBLIC_API_URL` en `.env.local`) y usar `title: { template: '%s | Tensi', default: 'Tensi — Controla tu presión arterial' }` simplificando los títulos de página a `'Iniciar sesión'`, `'Crear cuenta'`, etc. `title.default` es **obligatorio** si se define `template` (Context7: *Metadata Fields > title > template*; doc local `generate-metadata.md:283-289`). Cambia el HTML de `<title>` de 6 rutas y depende de una variable de entorno → no se aplica sin confirmación. |
| 3 | Baja | No existe `app/global-error.tsx` ni `app/error.tsx` (glob `app/**/{error,global-error}.tsx` = 0 resultados) | Si el layout raíz falla (p. ej. `verifySession()` lanzando un error de red/5xx contra la API), cae la página 500 interna de Next, que **no** incluye `globals.css` ni el tema oscuro. | **No aplicado (recomendación)**: crear `app/global-error.tsx` (`'use client'`, con sus propios `<html>`/`<body>` y estilos, prop `retry`) y `app/(dashboard)/error.tsx` con copy en español y los tokens `tensi`. Evidencia Context7: *Implement Global Error Boundary with global-error.js* + doc local `error.md:163-167`. Archivos nuevos con decisión de copy/diseño → fuera del alcance de esta pasada. |
| 4 | Baja | `app/layout.tsx:29-30` | El tema es oscuro fijo pero no se declara `colorScheme`. | **No aplicado (recomendación)**: `export const viewport: Viewport = { themeColor: "#030712", colorScheme: "dark" }` para scrollbars, autofill y controles nativos oscuros. Es un cambio visual; los mockups de `references/` no lo cubren → requiere validación contra el mockup. |

### `app/page.tsx`

Sin hallazgos. Es un **Server Component** sin `"use client"` (`app/page.tsx:1-14`), y toda la interactividad (modales, calculadora, toasts, header) se delega a componentes cliente hijos. `AuthModalsProvider` se importa como componente cliente y envuelve a los hijos: los `children` siguen renderizándose en el servidor (patrón correcto de frontera client, no se serializan funciones ni objetos). No manipula `<head>` ni duplica metadatos.

### `app/(auth)/layout.tsx`

| # | Severidad | Evidencia (línea/código) | Problema | Recomendación / cambio |
| --- | --- | --- | --- | --- |
| 5 | Media | `app/(auth)/layout.tsx:1-21` antes del cambio | Las rutas de auth (`/login`, `/register`, `/verify-account`, `/forgot-password`, `/reset-password`) no definían `robots`, así que eran indexables (el `metadata` raíz tampoco lo bloquea). | **Aplicado**: `export const metadata: Metadata = { robots: { index: false, follow: false } }`. El metadata de un layout se hereda por los segmentos hijos y se combina con el `title` de cada página (confirmado en ejecución: `/login` → `title="Iniciar sesión — Tensi"` + `<meta name="robots" content="noindex, nofollow">`). Único efecto: SEO; reversible borrando el export. |
| 6 | Baja | `app/(auth)/layout.tsx:23` → `antialiased` | `antialiased` ya está aplicado en `<html>` del layout raíz (`app/layout.tsx:30`): clase duplicada. | Eliminar `antialiased` del div del layout de auth. Sin cambio visual; no aplicado por ser puramente cosmético en el código. |
| 7 | Baja | `app/(auth)/layout.tsx:21` (`LayoutProps<'/'>`) | Posible duda de tipado (¿no debería ser `LayoutProps<'/(auth)'>`?). | **Verificado correcto**: `next typegen` genera `LayoutRoutes = "/"` (los grupos de ruta no producen una entrada propia en `.next/types/routes.d.ts`), así que `LayoutProps<'/'>` es el único literal válido. No se toca. |

### `app/(auth)/login/page.tsx`, `register`, `forgot-password`

Sin hallazgos. Server Components, `export const metadata: Metadata` por página (doc local `layout.md:544-568`, `generate-metadata.md:209-213`), y el formulario cliente se importa como hijo. No hay `searchParams`, por lo que siguen siendo estáticas.

### `app/(auth)/verify-account/page.tsx` y `app/(auth)/reset-password/page.tsx`

Sin hallazgos. Tipado correcto con el helper global `PageProps<'/verify-account'>` / `PageProps<'/reset-password'>` (doc local `page.md:123-140`), `const params = await searchParams` (los `searchParams` son `Promise` desde Next 15, `page.md:117-119`) y `typeof params.email === 'string'` cubre el caso `string[] | undefined`. El uso de `searchParams` convierte la ruta en dinámica, que es lo correcto y necesario para prellenar el email (`page.md:119`).

### `app/(dashboard)/layout.tsx`

| # | Severidad | Evidencia (línea/código) | Problema | Recomendación / cambio |
| --- | --- | --- | --- | --- |
| 8 | Media | `app/(dashboard)/layout.tsx:8-11` | El layout resuelve la sesión pero **no** redirige si `user === null`; la guarda vive solo en `app/(dashboard)/dashboard/page.tsx:13-15`. Hoy funciona (verificado con cookie inválida → `307 /login`), pero cualquier ruta futura bajo `(dashboard)` tendrá que repetir el `redirect`. | **No aplicado (recomendación)**: mover `if (!user) redirect('/login')` al layout y dejar la página sin guarda (o mantenerla como defensa en profundidad). `redirect()` es válido en Server Components/layouts; cambia de dónde proviene el redirect → se describe, no se aplica. |
| 9 | Baja | `app/(dashboard)/layout.tsx:9` (`await verifySession()`) | El layout accede a `cookies()` (no cacheado), por lo que la navegación bloquea y un `loading.tsx` del mismo segmento **no** puede mostrar fallback de la sesión. | **No aplicado (recomendación)**: mover el fetch no cacheado a `page.tsx`, o envolver el acceso a sesión en su propio `<Suspense>` con fallback. Evidencia: doc local `layout.md:316-362` ("Interaction with `loading.js`") y `loading.md:86-93`. |
| 10 | Baja | No existe `app/(dashboard)/loading.tsx` ni `app/(dashboard)/error.tsx` | Navegar a `/dashboard` no muestra shell de carga y un 5xx de la API propaga al 500 interno de Next. | **No aplicado (recomendación)**: crear `loading.tsx` (skeleton con `bg-slate-900/60`) y `error.tsx` (`'use client'`, prop `retry`) para el segmento. Archivos nuevos → fuera del alcance de esta pasada. |

### `app/(dashboard)/dashboard/page.tsx`

Sin incumplimientos.

- `verifySession()` repetido respecto al layout **es el patrón documentado**, no un bug: el layout no puede pasar datos a sus hijos, y la doc recomienda volver a pedir los datos en la ruta usando `cache()` para deduplicar (`layout.md:364-368`); `lib/auth/dal.ts:18` ya envuelve `verifySession` en `cache()` de React.
- El orden `await verifySession()` → `redirect('/login')` es correcto (`redirect` fuera de `try/catch`).
- Recomendación baja (no aplicada): añadir `robots: { index: false }` al `metadata` de la página o del layout de `(dashboard)` por higiene SEO. En la práctica no es indexable porque `proxy.ts` responde `307 /login` sin cookie (verificado).

### `proxy.ts`

Sin incumplimientos. Cumple al 100 % la convención de Next 16:

- Archivo `proxy.ts` en la raíz del proyecto, al mismo nivel que `app/` (doc local `proxy.md:23`).
- Export nombrado `proxy` (antes `middleware`), que es el nombre obligatorio desde Next 16 (Context7: *Rename Middleware Function to Proxy*, `version-16`).
- `export const config = { matcher: [...] }` (`proxy.md:67-86`) y comentario que reconoce que es un chequeo **optimista** y que la verificación real la hace el DAL (coherente con `proxy.md:29`: *"Proxy is not intended for slow data fetching... optimistic checks"*).

Verificación en ejecución (Playwright, contexto sin cookies):

| Caso | Resultado |
| --- | --- |
| `GET /dashboard` sin cookie | `307` → `location: /login` |
| `GET /dashboard/settings` sin cookie (ruta inexistente) | `307` → `location: /login` |
| `/dashboard` con `tensi_token` inválida | `307` → `/login` (lo detecta `verifySession()`, no el proxy) |
| `/dashboard` con `tensi_token` válida | `200`, renderiza "Dashboard / Admin / admin@tensi.com / FREE" |

Esto confirma además que el patrón `:path*` cubre también el path raíz `/dashboard`.

Mejoras (baja, no aplicadas):

- `proxy.ts:12-15`: el redirect pierde el destino solicitado; usar `new URL('/login', request.url)` + `loginUrl.searchParams.set('next', request.nextUrl.pathname)` mejora la UX post-login, pero requiere que el formulario/action lea `next` (cambio de comportamiento en archivos fuera de alcance).
- `proxy.ts:21`: `matcher: ['/dashboard/:path*']` es suficiente (verificado), pero `['/dashboard', '/dashboard/:path*']` explicita la intención y evita depender de la semántica `*`.

### `next.config.ts`

Sin incumplimientos. Config vacía = valores por defecto válidos para App Router (`reactStrictMode` es `true` por defecto en App Router desde 13.5.1 — `next.config/01-next-config-js/reactStrictMode.md:8`; no activar `reactCompiler` es una decisión del proyecto y se respeta).

| # | Severidad | Evidencia | Problema | Recomendación |
| --- | --- | --- | --- | --- |
| 11 | Baja | `next.config.ts:3-5` | `typedRoutes` es `false` por defecto (`node_modules/next/dist/server/config-shared.js:96`), así que un `href` mal escrito no falla en compilación. | **No aplicado (recomendación)**: activar `typedRoutes: true` (ya es opción estable, `next-config-js/typedRoutes.md:6`). **Bloqueante actual**: `lib/auth/hooks/use-register-form.ts:28` y `lib/auth/hooks/use-forgot-form.ts:25` usan `router.push(\`/verify-account?email=${...}\`)` con template literal, que no es asignable a `Route` bajo typedRoutes; habría que tipar esas llamadas primero (fuera del alcance de este informe). |

### `app/globals.css`

Sin incumplimientos. Verificado en el navegador que el tema se aplica: `getComputedStyle(document.body).fontFamily === '"Plus Jakarta Sans", "Plus Jakarta Sans Fallback", system-ui, ...'` y `backgroundColor === rgb(3, 7, 18)` (coincide con `--background: #030712`). Es decir, `--font-sans: var(--font-plus-jakarta-sans)` dentro de `@theme inline` sí se emite como custom property en `:root` (Context7: *@theme convierte los tokens en variables CSS en `:root`*).

| # | Severidad | Evidencia | Problema | Recomendación |
| --- | --- | --- | --- | --- |
| 12 | Baja | `app/globals.css:36-45` (`@keyframes toast-in`) + `components/site/toast.tsx:71` (`animate-[toast-in_0.3s_ease-out]`) | Funciona, pero el idioma Tailwind v4 es declarar la animación como token de tema. | Definir `--animate-toast-in: toast-in 0.3s ease-out` (y los `@keyframes` juntos) dentro de `@theme` y usar `animate-toast-in`. **No aplicado** porque exige editar `components/site/toast.tsx`, fuera de los archivos de esta auditoría. Evidencia Context7: *Customize animation theme with @theme directive*. (Definir los `@keyframes` fuera de `@theme` es válido y garantiza que siempre se emitan — *Defining animation keyframes*.) |
| 13 | Baja | `app/globals.css:36-45` | No hay respeto por `prefers-reduced-motion` para la animación del toast (`transform: translateY`). | Añadir un bloque `@media (prefers-reduced-motion: reduce)` que anule esa animación (WCAG 2.2, 2.3.3). No aplicado: el subagente de accesibilidad tiene su propio informe y el criterio de motion es transversal. |
| 14 | Baja | `app/globals.css:30-34` | El `font-family` se fija a mano en `body` en vez de usar la utilidad `font-sans`. | Es una alternativa válida en Tailwind v4 (Preflight ya no aplica `--font-sans` al `body`), así que no es un incumplimiento; si se prefiere, mover a `className="font-sans"` en `<html>`. No aplicado. |

## Cambios aplicados (2 archivos, dentro del alcance)

1. **`app/layout.tsx`**
   - `import type { Metadata, Viewport } from "next";` (añadido `Viewport`).
   - Nuevo `export const viewport: Viewport = { themeColor: "#030712" }` con comentario del porqué.
2. **`app/(auth)/layout.tsx`**
   - `import type { Metadata } from 'next'` + `export const metadata: Metadata = { robots: { index: false, follow: false } }` con comentario explicativo.

Verificación posterior:

- `pnpm lint` → sin errores ni warnings.
- `pnpm exec tsc --noEmit` → sin errores.
- `pnpm exec next typegen` → tipos de rutas regenerados (`.next/types/routes.d.ts`), sin cambios inesperados.
- Playwright contra el dev server (HMR aplicó los cambios): `<meta name="theme-color" content="#030712">` en `/`; `<meta name="robots" content="noindex, nofollow">` en `/login`; `<meta name="viewport" content="width=device-width, initial-scale=1">` preservado (el export `viewport` no elimina el default); sin errores de consola ni de hidratación (el único `404` de consola es el esperado al visitar una ruta inexistente).
- No se ejecutó `pnpm build` para no interferir con el `next dev` del usuario que estaba activo (PID 25783); los cambios son de `<head>` y quedaron verificados en el render real.

## No verificado

- **`pnpm build` de producción** — no ejecutado para no pisar `.next` del dev server activo del usuario. Los cambios aplicados sí se verificaron sobre el render real.
- **`app/not-found.tsx` / `app/global-not-found.tsx`** — no existen; el 404 por defecto se sirve con status `404` dentro del layout raíz (comprobado con `GET /no-existe-esta-ruta` → 404). La doc advierte que el 404 por defecto sigue `prefers-color-scheme` del sistema y **no** el tema de la app (`not-found.md:45`), así que conviene un `not-found.tsx` propio o `global-not-found` (experimental, requiere `experimental.globalNotFound` en `next.config.ts`). No aplicado: archivo nuevo + decisión de copy.
- **`colorScheme: 'dark'`** — cambio visual no validado contra los mockups de `references/`.
- **Título con plantilla (`title.template`)** — no aplicado; el resultado exacto de `<title>` por ruta es una decisión de producto.
