# SPEC 17 — Núcleo portable y frontera lógica/UI (preparación Expo)

> **Status:** Aproved
> **Depends on:** SPEC 03, SPEC 06, SPEC 07, SPEC 11, SPEC 12
> **Date:** 2026-10-09
> **Objective:** Fijar la frontera entre lógica portable (reutilizable por la futura app Expo) y código web, con un guard de lint, tokens de diseño en TS y un adaptador de navegación, sin cambiar el comportamiento actual de la web.

## Por qué existe esta spec

- Se construirá una app **React Native Expo** que reutilizará lógica y, vía **DOM components** (`'use dom'`), los componentes web. Primero se termina la web, pero debe quedar preparada para que Expo la consuma fácilmente.
- Hoy la reutilización está acoplada: hooks de `lib/**` importan `next/navigation` (`use-profile-form`, `use-active-nav-id`, hooks de auth); hay tipos `Route` de `next` en helpers (`lib/readings/analytics.ts`, `lib/readings/pagination.ts`); hooks que tocan DOM (`use-native-dialog`, `use-toast-item`, `use-oauth`); y **15 componentes** usan `next/link` directo, más `next/image` en `brand-logo.tsx`.
- Los **Server Components no se pueden portar** a Expo: la guía de migración web→native exige separar la frontera de datos de la vista presentacional.
- Los tokens de marca viven solo en `app/globals.css` (`@theme inline`); Expo necesita una fuente en TypeScript.

## Alcance

**In:**

- **Capa portable `lib/**/core/**`** (convención nueva, **sin mover archivos existentes**, siguiendo el idiom ya usado `lib/**/hooks/**` de SPEC 11): aquí vivirá la lógica reutilizable por web y Expo (tipos, zod, clientes `fetch`, helpers puros, hooks sin Next/DOM).
- **Guard de lint** sobre `lib/**/core/**`: prohíbe importar `next/*` y `server-only`, y usar globals de navegador (`window`, `document`, `localStorage`).
- **Tokens de diseño en TS**: `lib/theme/tokens.ts` con la paleta/escala; `app/globals.css` los refleja como espejo documentado.
- **Adaptador de navegación** `components/ui/app-link.tsx` que envuelve `next/link`; las vistas portables lo usan para no depender de Next directamente.
- **Convención documentada en `AGENTS.md`** ("frontera de datos + vista portable"): `page.tsx` (Server Component delgado) resuelve datos con `verifySession()` y monta una **vista cliente** que recibe props, sin `next/headers` ni `next/link` directo; objetivo DOM-component.
- Sin cambios de comportamiento en las pantallas actuales.

**Out of scope (para specs futuras):**

- Crear la app Expo y el shell de DOM components.
- Mover archivos existentes a `lib/**/core/**` (migración incremental al tocar cada dominio).
- Monorepo / `packages/core`.
- Theming real (claro/oscuro) → spec de Apariencia.
- Cambios en `nest-tensi-api`.

## Modelo de datos

No hay datos de dominio nuevos. Se añade el espejo de tokens:

`lib/theme/tokens.ts` (espejo del `@theme` de `app/globals.css`):

```ts
export const COLOR_TOKENS = {
  tensi50: "#f0f7ff",
  tensi400: "#38bdf8",
  tensi500: "#06b6d4",
  tensi600: "#0284c7",
  tensi700: "#0369a1",
  tensiViolet: "#8b5cf6",
  tensiRose: "#f43f5e",
  tensiDark: "#030712",
  tensiCard: "#0f172a",
  background: "#030712",
  foreground: "#f1f5f9"
} as const

/** px por unidad de la escala de espaciado (--spacing 0.25rem con root 16px). */
export const SPACING_UNIT = 4
```

## Plan de implementación

1. **Tokens**: crear `lib/theme/tokens.ts` con las constantes y un comentario que apunte a `app/globals.css` como espejo (y el comentario inverso en el CSS). Verificación: `pnpm exec tsc --noEmit` y contraste manual de los valores con el `@theme`.
2. **Adaptador de navegación**: crear `components/ui/app-link.tsx` que envuelve `next/link` (props `Readonly<>`, reenvía `href`/`className`/`children` y el resto). Verificación: un enlace de prueba navega igual que `next/link`; `pnpm lint` limpio.
3. **Guard**: añadir a `eslint.config.mjs` un bloque `files: ["lib/**/core/**/*.{ts,tsx}"]` con `no-restricted-imports` (`next`, `next/*`, `server-only`) y `no-restricted-globals`/`no-restricted-syntax` para `window`/`document`/`localStorage`. Verificación: un archivo temporal `lib/x/core/tmp.ts` que importe `next/headers` falla el lint; se elimina después.
4. **Documentar la convención** en `AGENTS.md`: sección "Portabilidad web/Expo" con la frontera `core` vs web, la regla "frontera de datos + vista portable" y el uso de `AppLink` en las vistas. Verificación: lectura.
5. **Cierre**: `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build`; humo con Playwright (landing + dashboard) para confirmar que nada cambia.

## Criterios de aceptación

- [ ] Existe `lib/theme/tokens.ts` y sus valores coinciden con el `@theme inline` de `app/globals.css`.
- [ ] Existe `components/ui/app-link.tsx` y navega igual que `next/link`.
- [ ] Un archivo en `lib/**/core/**` que importe `next/*`/`server-only` o use `window`/`document`/`localStorage` falla `pnpm lint`.
- [ ] `AGENTS.md` documenta la frontera portable/web y la regla "frontera de datos + vista portable".
- [ ] Ninguna pantalla cambia de comportamiento; `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build` pasan.
- [ ] `git -C ../nest-tensi-api status --short` sin cambios (spec front-only).

## Decisiones

- **Sí:** capa portable como subárbol `lib/**/core/**`, siguiendo el idiom `lib/**/hooks/**`; **no** se mueve código existente.
- **Sí:** guard de lint por encima de solo documentación; hace la frontera ejecutable.
- **Sí:** tokens en TS por **espejo documentado** (barato) en vez de generar el `@theme` desde TS (tooling extra). Cuando exista Expo, `lib/theme/tokens.ts` pasa a ser la fuente única.
- **Sí:** `AppLink` como único seam de navegación para vistas portables.
- **No:** monorepo/`packages/core` ahora.
- **No:** mover archivos a `core` ni refactorizar los hooks acoplados a Next (se migran al tocar cada dominio).
- **No:** crear la app Expo en esta spec.

## Riesgos

| Riesgo                                           | Mitigación                                                                                              |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| El espejo de tokens deriva del CSS               | Comentario cruzado en ambos archivos + criterio que compara valores; a futuro, generar el CSS desde TS. |
| `AppLink` queda sin uso y se desincroniza        | Aplicarlo desde SPEC 18 en las vistas de Configuración; documentarlo en `AGENTS.md`.                    |
| El guard solo cubre `core`, no el resto del repo | Intencional: frontera nueva; migración incremental por dominio.                                         |
| Acoplar el núcleo a Next por el tipo `Route`     | Los tipos `Route` quedan en la capa web; el núcleo usa `string` y el borde castea.                      |

## Qué **no** entra en esta spec

- La app Expo y el shell de DOM components.
- Mover/refactorizar archivos existentes.
- Monorepo/paquete compartido.
- Theming claro/oscuro.
- Cambios en el back.

Cada uno, si se implementa, va en su propia spec.
