# SPEC 04 — Infra App Router: error/loading, SEO y rutas tipadas

> **Status:** Borrador
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
5. Crear `app/(dashboard)/loading.tsx`. Verificación: navegar a `/dashboard` muestra el fallback mientras responde la API.
6. Crear `app/(dashboard)/error.tsx`. Verificación: 5xx de `check-token` muestra la frontera.
7. Refactor de `app/(dashboard)/layout.tsx` para separar el shell estático de la resolución de sesión en `<Suspense>`. Verificación: el shell pinta antes que la sesión.
8. Ampliar `metadata` en `app/layout.tsx` y añadir `data-scroll-behavior="smooth"`. Verificación: `<title>`, metas y warning de Next.
9. Simplificar los títulos de página. Verificación: `/login` → `Iniciar sesión — Tensi`.
10. Añadir `robots` al segmento `(dashboard)`.

## Criterios de aceptación

- [ ] `GET /ruta-inexistente` responde 404 con el `not-found` propio y el tema oscuro.
- [ ] Un error en el layout raíz renderiza `global-error.tsx` (no la página 500 de Next).
- [ ] Un error en `(dashboard)` renderiza `(dashboard)/error.tsx` con un botón "Reintentar" (`retry`).
- [ ] Navegar a `/dashboard` muestra el skeleton de `loading.tsx` antes del contenido.
- [ ] El shell de `(dashboard)` no espera a `verifySession()` (la sesión se resuelve en un `<Suspense>`).
- [ ] `/login` tiene `<title>Iniciar sesión — Tensi</title>` y `/` el título por defecto.
- [ ] `metadataBase`, OpenGraph y Twitter están presentes en el HTML.
- [ ] El warning de Next 16 por `scroll-behavior: smooth` desaparece con `data-scroll-behavior="smooth"`.
- [ ] El segmento `(dashboard)` lleva `robots: noindex, nofollow`.
- [ ] Con `typedRoutes: true`, un `href` inválido rompe `tsc` (comprobado) y el build sigue verde.
- [ ] `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build` pasan.
- [ ] Playwright: `/`, `/login` y `/dashboard` sin errores de consola a 375px y 1440px.

## Decisiones

- **Sí:** `retry` (no `unstable_retry`): es estable desde Next 16.3 (doc local).
- **Sí:** `metadataBase` con fallback `http://localhost:3000` para no romper dev si falta la env.
- **Sí:** `title.template` acompañado de `title.default` (obligatorio).
- **Sí:** resolver la sesión en `<Suspense>` en vez de bloquear el layout; la autorización real sigue cerca de los datos.
- **No:** tema claro/oscuro y `colorScheme` en esta ronda.
- **No:** i18n.

## Riesgos

| Riesgo                                                     | Mitigación                                                                 |
| ---------------------------------------------------------- | -------------------------------------------------------------------------- |
| `typedRoutes` rompe rutas construidas con plantilla         | Tiparlas con `Route`/`as Route` y validar con `tsc` en el paso 1            |
| El refactor a `<Suspense>` altera cuándo ocurre el redirect | Mantener el `redirect` en el componente suspendible y probar sin cookie     |
| `NEXT_PUBLIC_SITE_URL` ausente en producción                | Fallback documentado y verificado en el paso 8                              |

## Qué **no** entra en esta spec

- Tema claro/oscuro, i18n, analítica.
- Regla `next/link` y migración de `<a>` (SPEC 07).
- A11y de componentes y primitivas UI (SPEC 06).

Cada uno, si se implementa, va en su propia spec.
