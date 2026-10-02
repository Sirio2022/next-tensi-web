# SPEC 06 — Accesibilidad y primitivas UI

> **Status:** Borrador
> **Depends on:** SPEC 02, SPEC 03
> **Date:** 2026-10-02
> **Objective:** Cerrar los hallazgos de accesibilidad y de las primitivas UI (movimiento reducido, jerarquía de encabezados, landmarks, atributos nativos y código muerto) sin alterar el diseño.

## Por qué existe esta spec

- `docs/react/04-app-config.md` #12/#13: el toast no respeta `prefers-reduced-motion` y los `@keyframes` no viven como token de tema.
- `docs/react/01-landing-site.md` #8/#11/#12: toast sin cierre/pausa, jerarquía de encabezados del footer y año hardcodeado.
- `docs/react/05-dashboard-shell.md`: landmarks sin nombre, activo por igualdad exacta, helper de scroll duplicado, `"use client"` redundante, `onLockedSelect` opcional y `nav.ts` con items mutables.
- `docs/react/06-dashboard-ui.md`: salto `h1→h3`, primitivas sin `...rest`, mapa de tonos duplicado, `categories` sin uso y grilla de rangos sin semántica.

## Alcance

**In:**

- `app/globals.css`: `@media (prefers-reduced-motion: reduce)` que anule la animación del toast; mover `@keyframes toast-in` a `@theme` como `--animate-toast-in` y usar `animate-toast-in` en `components/site/toast.tsx`.
- `components/site/toast.tsx`: botón de cierre y pausa del auto-descarte en `hover`/`focus` (WCAG 2.2.1).
- `components/site/site-footer.tsx`: bajar "Enlaces" y "Desarrollado por" a `<h3>`; **no** derivar el año (dejarlo fijo) o derivarlo — decisión: dejarlo fijo para output determinista; convertir Términos/Privacidad en texto no interactivo (los `<a href="#">` desaparecen).
- `components/dashboard/empty-readings-card.tsx`, `bp-ranges-reference.tsx` y `upgrade-banner.tsx`: cambiar sus `<h3>` a `<h2>` (no hay `<h2>` hoy y se salta un nivel).
- `components/dashboard/dashboard-header.tsx`: mantener "Panel Principal" como etiqueta no encabezado (decisión) para que el `<h1>` viva en la página.
- `components/dashboard/dashboard-shell.tsx`: `id="main-content"` en `<main>` + skip-link "Saltar al contenido".
- `components/dashboard/dashboard-sidebar.tsx`: `active` por prefijo (`pathname === href || pathname.startsWith(href + '/')`); extraer `scrollToUpgradeBanner` a `lib/dashboard/scroll-to-upgrade.ts`.
- `components/dashboard/sidebar-nav-item.tsx`: quitar el `"use client"` redundante; unión discriminada para `onLockedSelect` cuando `requiresPremium`.
- `components/ui/badge.tsx`, `card.tsx` y `lock-badge.tsx`: extender `HTMLAttributes` + `ref` (React 19) y hacer `{...rest}` sobre el nodo raíz (aditivo).
- Mapa `tone → clases` compartido (`components/ui/tone-classes.ts`) consumido por `Badge` y por `bp-ranges-reference.tsx`, unificando `amber`.
- `lib/dashboard/bp-ranges.ts`: resolver `categories` sin uso (decidir consumirlo para validar/derivar o retirarlo; si SPEC 03 lo exige, consumirlo).
- `lib/dashboard/nav.ts`: tipar los items como `Readonly<DashboardNavItem>`.
- `components/dashboard/empty-readings-card.tsx`: CTA "Agregar mi primera medición" `disabled` con nota visible hasta que exista la acción.
- `components/dashboard/bp-ranges-reference.tsx`: usar `<ul>`/`<li>` para la grilla de rangos (sin cambiar el layout).

**Out of scope (para specs futuras):**

- Tema claro/oscuro (SPEC 04).
- Migración `<a>` → `next/link` (SPEC 07).
- `<dialog>` nativo y auth (SPEC 05).
- Rediseño visual o nuevos componentes.

## Modelo de datos

No hay estructuras de datos nuevas. Se añaden dos módulos:

```ts
// lib/dashboard/scroll-to-upgrade.ts
export function scrollToUpgradeBanner(): void

// components/ui/tone-classes.ts
export type ToneName = 'sky' | 'emerald' | 'emerald-soft' | 'amber' | 'orange' | 'rose' | 'neutral'
export const TONE_CLASSES: Record<ToneName, string>
```

## Plan de implementación

1. `app/globals.css` + `toast.tsx`: token `--animate-toast-in`, variante `motion-reduce` y botón de cierre/pausa. Verificación: con movimiento reducido el toast no anima; se puede cerrar y pausar.
2. `site-footer.tsx`: encabezados `<h3>`, Términos/Privacidad como texto. Verificación: outline sin saltos; sin `<a href="#">`.
3. Tarjetas del dashboard: `<h3>` → `<h2>`. Verificación: un solo `<h1>` y sin saltos de nivel.
4. `dashboard-shell.tsx`: skip-link + `id="main-content"`. Verificación: el skip-link recibe foco y salta al main.
5. `lib/dashboard/scroll-to-upgrade.ts` + consumir en `dashboard-sidebar.tsx` y `upgrade-button.tsx`. Verificación: "Mejorar Plan" y candados siguen desplazando a `#upgrade`.
6. `dashboard-sidebar.tsx`: activo por prefijo. Verificación: un ítem de subruta hipotética se marcaría activo (test unitario o revisión).
7. `sidebar-nav-item.tsx`: quitar `"use client"` y unión discriminada de props. Verificación: `lint`/`tsc`; el ítem premium siempre recibe handler.
8. `lib/dashboard/nav.ts`: items `Readonly`. Verificación: `tsc`.
9. `components/ui/tone-classes.ts` + `badge.tsx` + `bp-ranges-reference.tsx`: fuente única de tonos. Verificación: el color de `amber` es idéntico en badge y referencia.
10. `components/ui/{badge,card,lock-badge}.tsx`: `HTMLAttributes` + `ref` + `...rest`. Verificación: aceptan `aria-*`, `data-*` y `ref`.
11. `lib/dashboard/bp-ranges.ts`: consumir o retirar `categories` (sin código muerto). Verificación: `grep` sin símbolos sin uso.
12. `empty-readings-card.tsx`: CTA `disabled` con nota; grilla de rangos a `<ul>`/`<li>`.

## Criterios de aceptación

- [ ] Con `prefers-reduced-motion: reduce`, el toast no ejecuta la animación.
- [ ] El toast se puede cerrar manualmente y pausar con `hover`/`focus`.
- [ ] El documento tiene exactamente un `<h1>` y no hay saltos de nivel (`h1→h2→h3`).
- [ ] El footer y las tarjetas del dashboard usan la jerarquía corregida sin cambiar el diseño.
- [ ] Existe un skip-link funcional que lleva a `#main-content`.
- [ ] `Badge` unifica el tono `amber` con la referencia de rangos (misma clase).
- [ ] Las primitivas `Badge`, `Card` y `LockBadge` aceptan `aria-*`, `data-*` y `ref`.
- [ ] No queda `"use client"` en `sidebar-nav-item.tsx` ni items mutables en `nav.ts`.
- [ ] El ítem premium no puede renderizarse sin `onLockedSelect` (tipo).
- [ ] `lib/dashboard/bp-ranges.ts` no tiene símbolos sin consumidores.
- [ ] `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build` pasan.
- [ ] Playwright: `/` y `/dashboard` a 375px y 1440px sin scroll horizontal ni errores de consola; `aria-*` visibles en el DOM.

## Decisiones

- **Sí:** mover `@keyframes` a `@theme` como token `--animate-toast-in`.
- **Sí:** añadir cierre y pausa al toast (WCAG 2.2.1).
- **Sí:** el `<h1>` vive en la página; "Panel Principal" queda como etiqueta no encabezado; las tarjetas usan `<h2>`.
- **Sí:** fuente única de clases de tono (`tone-classes.ts`).
- **Sí:** primitivas con `HTMLAttributes` + `ref` (React 19, sin `forwardRef`).
- **Sí:** CTA vacío `disabled` (decisión de producto).
- **No:** implementar el toggle de tema claro.
- **No:** rediseñar el layout de las tarjetas.

## Riesgos

| Riesgo                                                     | Mitigación                                                              |
| ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| Cambiar encabezados altera estilos por selectores de tag    | Las clases están en el propio elemento; revisar en Playwright            |
| `<dialog>`/foco no entra aquí, pero interactúa con SPEC 05   | Coordinar el orden de implementación                                     |
| Ampliar props de primitivas rompe consumidores              | Cambio aditivo; `tsc` y consumidores revisados por `grep`               |
| El skip-link no debe verse si no tiene foco                 | Patrón `sr-only` + `focus:not-sr-only`                                  |

## Qué **no** entra en esta spec

- Tema claro/oscuro (SPEC 04).
- `<a>` → `next/link` (SPEC 07).
- `<dialog>` nativo y endurecimiento de auth (SPEC 05).
- Nuevos componentes o rediseño visual.

Cada uno, si se implementa, va en su propia spec.
