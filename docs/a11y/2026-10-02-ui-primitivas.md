# Informe de accesibilidad — UI y primitivas del dashboard

**Fecha:** 2026-10-02
**Alcance:** `app/globals.css`, `components/site/toast.tsx`, `components/site/site-footer.tsx`, `components/landing/features.tsx`, `components/dashboard/{dashboard-shell,dashboard-sidebar,sidebar-nav-item,empty-readings-card,bp-ranges-reference,upgrade-banner,upgrade-button}.tsx`, `components/ui/{badge,card,lock-badge,tone-classes}.tsx`, `lib/dashboard/{nav,bp-ranges,scroll-to-upgrade}.ts`
**Spec:** `specs/ui/06-accesibilidad-ui-primitivas.md`
**Estándar:** WCAG 2.2 nivel AA (`2.2.1 Timing Adjustable`, `1.3.1 Info and Relationships`, `2.4.1 Bypass Blocks`, `2.3.3 Animation from Interactions`)
**Herramientas:** Playwright (Chromium) + emulación de media + `pnpm lint` / `tsc --noEmit` / `next build`.

## Resultado

| Comprobación | Resultado |
| ------------ | --------- |
| `pnpm lint` | ✅ sin salida |
| `pnpm exec tsc --noEmit` | ✅ sin errores |
| `pnpm build` | ✅ compilado, 10 páginas |
| Consola `/` y `/dashboard` | ✅ 0 errores |
| Scroll horizontal 375px / 1440px | ✅ ninguno en ambas rutas |
| Jerarquía de encabezados | ✅ sin saltos |

## Evidencia por criterio

### 1. Movimiento reducido en el toast

`@keyframes toast-in` ahora vive dentro de `@theme inline` como `--animate-toast-in`, y el toast usa `animate-toast-in motion-reduce:animate-none`. Verificado en navegador con `emulate_media`:

| Media | `animation-name` | `animation-duration` |
| ----- | ---------------- | -------------------- |
| `no-preference` | `toast-in` | `0.3s` |
| `reduce` | `none` | `0s` |

### 2. Cierre y pausa del toast (WCAG 2.2.1)

El componente `Toast` vive con su propio `useEffect`/`setTimeout`; `onMouseEnter`/`onFocus` pausan (cancelan el timer) y `onMouseLeave`/`onBlur` lo reanudan. El botón de cierre tiene `aria-label="Cerrar notificación"`.

> **Limitación:** `showToast` no tiene consumidores en la app (el trigger del toast entra en otra spec), así que el flujo no se pudo disparar end-to-end. La evidencia es por inspección de código + el CSS compilado verificado en el navegador.

### 3. Jerarquía de encabezados

Extraído del DOM con Playwright:

- `/` → `H1 > H2 > H2 > H2 > H2 > H2 > H3 > H3` (1 `h1`, 5 `h2`, 2 `h3`) — sin saltos.
- `/dashboard` → `H1 > H2 > H2 > H2` (1 `h1`) — sin saltos.

Cambios: `features.tsx` `h3→h2`; `empty-readings-card.tsx`, `bp-ranges-reference.tsx` y `upgrade-banner.tsx` `h3→h2`; footer "Enlaces"/"Desarrollado por" a `h3`. "Panel Principal" sigue como `<p>` (no encabezado).

### 4. Footer sin `<a href="#">`

Links del footer tras el cambio: `#contacto|Contacto` y `mailto:juanmadev@icloud.com|…`. Términos y Privacidad quedaron como texto no interactivo. Encabezados del footer: `["Enlaces","Desarrollado por"]` en `<h3>`.

### 5. Skip-link y `id="main-content"`

`main#main-content tabindex="-1"`. Al pulsar el primer `Tab` en `/dashboard`, el foco cae en "Saltar al contenido", que pasa de `sr-only` a `position: absolute` (visible). El click desplaza a `#main-content`.

### 6. Primitivas con atributos nativos

`Badge`, `Card` y `LockBadge` extienden `HTMLAttributes` + `ref` (React 19, sin `forwardRef`). Prueba observable: `Card id="upgrade"` renderiza `<div id="upgrade" class="rounded-3xl …">`, confirmando que `...rest` reenvía atributos. Los `LockBadge` exponen `aria-label="Requiere plan Premium"`; los landmarks tienen nombre accesible (`aside[aria-label="Barra lateral"]`, `nav[aria-label="Navegación principal"]`).

### 7. Estado de navegación y código muerto

- `sidebar-nav-item.tsx` sin `"use client"`.
- `nav.ts`: items `readonly Readonly<DashboardNavItem>[]` y unión discriminada (`requiresPremium: true` exige `onLockedSelect` a nivel de tipo).
- `active`: prefijo (`pathname === href || pathname.startsWith(href + "/")`).
- `scrollToUpgradeBanner` único en `lib/dashboard/scroll-to-upgrade.ts`, consumido por sidebar y `upgrade-button.tsx`. Verificado: al hacer click en "Análisis" (bloqueado), `scrollY` pasa de 0 a 1155 y `#upgrade` queda a ~111px del top.
- `bp-ranges.ts`: `categories` consumido como `data-categories` en las `<li>` de la referencia (p. ej. `"mild_hypotension moderate_hypotension severe_hypotension"`), y la grilla es `UL > LI`.

## Artefactos

- `verify-06-styles.css` — hoja compilada con `--animate-toast-in` y la regla `motion-reduce`.
- `verify-06-dashboard-1440.png`, `verify-06-dashboard-375.png`, `verify-06-home-375.png` — capturas.
- `verify-06-mock-api.log`, `verify-06-dev.log` — logs de la verificación.
