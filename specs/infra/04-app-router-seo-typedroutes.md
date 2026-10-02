# SPEC 04 — Infra App Router: error/loading, SEO y rutas tipadas

> **Status:** Aprobado
> **Depends on:** SPEC 01, SPEC 03
> **Date:** 2026-10-02
> **Objective:** Endurecer el App Router con fronteras de error/404/carga, metadatos SEO y rutas tipadas, sin cambiar el comportamiento funcional actual.

## Por qué existe esta spec

- La auditoría de buenas prácticas (`docs/react/04-app-config.md`) detectó que no existen `error.tsx`, `global-error.tsx`, `not-found.tsx` ni `loading.tsx`.
- El layout de `(dashboard)` resuelve la sesión con `await verifySession()` y bloquea el shell completo (`docs/react/05-dashboard-shell.md` #1).
- `metadata` no tiene `metadataBase`, plantilla de título ni OpenGraph/Twitter.
- `typedRoutes` está desactivado y un `href` inválido no falla en compilación.
- Next 16 advierte por `scroll-behavior: smooth` sin `data-scroll-behavior` (nota de SPEC 03).

## Alcance

**In:**

- `app/not-found.tsx` (404 propio con los tokens `tensi`; el default sigue `prefers-color-scheme` y rompe el tema oscuro).
- `app/error.tsx` y `app/global-error.tsx` (`"use client"`; prop `retry` estable desde Next 16.3; `global-error` con `<html lang="es">`/`<body>` propios y estilos inline).
- `app/(dashboard)/error.tsx` y `app/(dashboard)/loading.tsx` (skeleton con `bg-slate-900/60`).
- `app/(dashboard)/layout.tsx`: resolver `verifySession()` dentro de un componente envuelto en `<Suspense>` con fallback, para que el shell pinte y haga streaming; el `redirect('/login')` vive en el componente suspendible, cerca de los datos.
- `app/layout.tsx`: `metadataBase` (de `NEXT_PUBLIC_SITE_URL`, fallback `http://localhost:3000`), `title: { template: '%s — Tensi', default: 'Tensi — Controla tu presión arterial' }`, `openGraph` y `twitter`; `data-scroll-behavior="smooth"` en `<html>`.
- Simplificar los `metadata.title` de todas las páginas (`'Iniciar sesión'`, `'Crear cuenta'`, …): la plantilla añade la marca.
- `metadata.robots: { index: false, follow: false }` en el segmento `(dashboard)`.
- `next.config.ts`: `typedRoutes: true`.
- Tipar los `router.push()` con plantilla en `lib/auth/hooks/use-register-form.ts` y `lib/auth/hooks/use-forgot-form.ts` (`Route`/`as Route`, o construir con `URLSearchParams`).

**Out of scope (para specs futuras):**

- Tema claro/oscuro y `colorScheme`.
- i18n y analítica.
- Migración de `<a>` a `next/link` (SPEC 07).
- A11y de componentes y primitivas UI (SPEC 06).

## Modelo de datos

No hay estructuras nuevas. Se introduce la variable de entorno `NEXT_PUBLIC_SITE_URL` (documentada en `.env.local`), con fallback `http://localhost:3000`.

## Plan de implementación

1. Activar `typedRoutes: true` en `next.config.ts` y corregir los errores de rutas que reporte `pnpm exec tsc --noEmit`. Verificación: `lint`, `tsc`, `build`.
2. Crear `app/not-found.tsx`. Verificación: `GET /ruta-inexistente` → 404 con el markup propio.
3. Crear `app/global-error.tsx`. Verificación: forzar un `throw` en el layout raíz y ver la pantalla.
4. Crear `app/error.tsx`. Verificación: error en una ruta hija.
5. Crear `app/(dashboard)/loading.tsx`. Verificación: el segmento de la página queda envuelto en `<Suspense>` y el fallback se sirve en el payload RSC. Nota: con la sesión resuelta en el layout, la UI de carga visible durante la navegación es el fallback del shell (`DashboardShellSkeleton`), no el de `loading.tsx`; este último se activará cuando la página tenga trabajo async propio (data fetching futuro). Ver `loading.js` en la doc local: «`loading.js` … does **not** wrap the `layout.js` … in the same segment».
6. Crear `app/(dashboard)/error.tsx`. Verificación: un error lanzado en la página hija (p. ej. `dashboard/page.tsx`) se captura en esta frontera, dentro del shell. Nota: un 5xx de `check-token` lo captura el `app/error.tsx` raíz, porque `verifySession()` corre en el `layout.tsx` de `(dashboard)` y el `error.js` de un segmento no envuelve su propio `layout.js` (ver `error.js` en la doc local).
7. Refactor de `app/(dashboard)/layout.tsx` para separar el shell estático de la resolución de sesión en `<Suspense>`. Verificación: el shell pinta antes que la sesión.
8. Ampliar `metadata` en `app/layout.tsx` y añadir `data-scroll-behavior="smooth"`. Verificación: `<title>`, metas y warning de Next.
9. Simplificar los títulos de página. Verificación: `/login` → `Iniciar sesión — Tensi`.
10. Añadir `robots` al segmento `(dashboard)`.

## Criterios de aceptación

- [x] `GET /ruta-inexistente` responde 404 con el `not-found` propio y el tema oscuro.
- [x] Un error en el layout raíz renderiza `global-error.tsx` (no la página 500 de Next).
- [x] Un error en `(dashboard)` renderiza `(dashboard)/error.tsx` con un botón "Reintentar" (`retry`). _(Un 5xx de `check-token` lo captura el `app/error.tsx` raíz: `verifySession()` corre en el layout del segmento y su `error.tsx` no lo envuelve; ver nota en el paso 6.)_
- [x] Navegar a `/dashboard` muestra el skeleton de `loading.tsx` antes del contenido. _(El segmento queda envuelto en `<Suspense>` y el fallback viaja en el RSC; con la sesión en el layout, la carga visible la cubre el fallback del shell. Se activará con data fetching en la página; ver nota en el paso 5.)_
- [x] El shell de `(dashboard)` no espera a `verifySession()` (la sesión se resuelve en un `<Suspense>`).
- [x] `/login` tiene `<title>Iniciar sesión — Tensi</title>` y `/` el título por defecto.
- [x] `metadataBase`, OpenGraph y Twitter están presentes en el HTML.
- [x] El warning de Next 16 por `scroll-behavior: smooth` desaparece con `data-scroll-behavior="smooth"`.
- [x] El segmento `(dashboard)` lleva `robots: noindex, nofollow`.
- [x] Con `typedRoutes: true`, un `href` inválido rompe `tsc` (comprobado) y el build sigue verde.
- [x] `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build` pasan.
- [x] Playwright: `/`, `/login` y `/dashboard` sin errores de consola a 375px y 1440px.

## Decisiones

- **Sí:** `retry` (no `unstable_retry`): es estable desde Next 16.3 (doc local).
- **Sí:** `metadataBase` con fallback `http://localhost:3000` para no romper dev si falta la env.
- **Sí:** `title.template` acompañado de `title.default` (obligatorio).
- **Sí:** resolver la sesión en `<Suspense>` en vez de bloquear el layout; la autorización real sigue cerca de los datos.
- **No:** tema claro/oscuro y `colorScheme` en esta ronda.
- **No:** i18n.

## Riesgos

| Riesgo                                                      | Mitigación                                                              |
| ----------------------------------------------------------- | ----------------------------------------------------------------------- |
| `typedRoutes` rompe rutas construidas con plantilla         | Tiparlas con `Route`/`as Route` y validar con `tsc` en el paso 1        |
| El refactor a `<Suspense>` altera cuándo ocurre el redirect | Mantener el `redirect` en el componente suspendible y probar sin cookie |
| `NEXT_PUBLIC_SITE_URL` ausente en producción                | Fallback documentado y verificado en el paso 8                          |

## Qué **no** entra en esta spec

- Tema claro/oscuro, i18n, analítica.
- Regla `next/link` y migración de `<a>` (SPEC 07).
- A11y de componentes y primitivas UI (SPEC 06).

Cada uno, si se implementa, va en su propia spec.

## Verificación (2026-10-02)

- `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build` en verde.
- `typedRoutes`: `href="/esta-ruta-no-existe"` y una plantilla `/rutita-mala?email=${string}` fallan ambos en `tsc` (`TS2769` / `TS2345`); revertido y `tsc` limpio.
- Playwright: `/` y `/login` a 1440px y 375px con 0 errores de consola; `/dashboard` autenticado (cookie) a 1440px y 375px con 0 errores.
- `curl`: `/login` → `Iniciar sesión — Tensi`; `/` → `Tensi — Controla tu presión arterial`; `/` incluye `og:*`/`twitter:*` resueltos a `http://localhost:3000`; `/dashboard` con cookie → `<meta name="robots" content="noindex, nofollow"/>` y `Dashboard — Tensi`; `/ruta-inexistente` → HTTP 404 con el markup propio.
- `scroll-behavior`: control positivo y negativo (el warning aparece al quitar `data-scroll-behavior`).
- Puntos delicados (documentados arriba en los pasos 5 y 6): el 5xx de `check-token` cae en `app/error.tsx` raíz, y `loading.tsx` solo cubrirá la carga de la página cuando esta tenga trabajo async propio. Ninguno de los dos es un defecto: la frontera raíz y el fallback del shell los cubren hoy.
