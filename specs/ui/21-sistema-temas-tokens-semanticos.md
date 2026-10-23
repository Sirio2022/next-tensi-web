# SPEC 21 — Sistema de temas y tokens semánticos

> **Status:** Aprobado
> **Depends on:** SPEC 02, SPEC 03, SPEC 06, SPEC 17
> **Date:** 2026-10-23
> **Objective:** Introducir un sistema de tokens semánticos y atributos de tema (`data-theme`, `data-accent`, `data-contrast`, `data-motion`, `data-density`) que permita pintar toda la app en claro u oscuro, con acento configurable, alto contraste, motion reducido y densidad compacta, sin parpadeo y sin acoplar la UI a una paleta hardcodeada.

## Por qué existe esta spec

- SPEC 18 dejó `/dashboard/settings/appearance` como `ComingSoonSection`. La sección real se implementa en SPEC 22, pero antes hace falta que exista algo que aplicar.
- Hoy la app es **solo oscura**. `app/globals.css` define los tokens de marca (`tensi-*`) y `--background`/`--foreground`, pero el resto de la UI usa clases estructurales hardcodeadas: `bg-slate-950`, `bg-slate-900/60`, `border-slate-800`, `text-white`, `text-slate-400`, `bg-indigo-*`. El barrido inicial detecta **87 archivos** entre `app/` y `components/`.
- No hay tokens semánticos (superficie, tarjeta, borde, texto, acento, foco) ni variantes para tema claro, acento, contraste, motion o densidad.
- Las gráficas de Recharts usan hex fijos (`#0f172a`, `#1e293b`, `#64748b`, `#fb7185`, `#38bdf8`) que no se adaptan a un tema claro.
- La landing y las pantallas de auth son públicas: sin sesión no hay preferencia guardada, así que deben seguir `prefers-color-scheme` del sistema.
- `lib/theme/tokens.ts` es el espejo TypeScript de los tokens (SPEC 17) y solo cubre la paleta de marca; hay que ampliarlo para que Expo pueda reutilizar el sistema.
- Se decidió **partir el trabajo en dos specs**: esta construye el sistema y el refactor; SPEC 22 añade la sección Apariencia, la persistencia en Nest y el wiring de los controles.

## Alcance

**In:**

- **Tokens semánticos** en `app/globals.css` (`@theme inline` + variables en `:root` y `[data-theme="light"]`):
  - Superficies: `--color-surface` (fondo de página), `--color-card` (tarjetas), `--color-card-muted` (inputs, filas alternas, superficies anidadas).
  - Bordes: `--color-line`, `--color-line-strong`.
  - Texto: `--color-fg`, `--color-fg-muted`, `--color-fg-subtle`, `--color-fg-inverted`.
  - Acento: `--color-accent`, `--color-accent-hover`, `--color-accent-soft`, `--color-accent-line`, `--color-accent-fg` (texto sobre acento), `--color-accent-text` (acento como texto sobre superficie).
  - Foco: `--color-focus`.
  - Gráficas: `--color-chart-grid`, `--color-chart-axis`, `--color-chart-tooltip`, `--color-chart-tooltip-line`, `--color-chart-systolic`, `--color-chart-diastolic`.
- **Tema oscuro por defecto** en `:root` y **tema claro** en `[data-theme="light"]`; `[data-theme="dark"]` explícito para forzar oscuro.
- **Fallback de sistema** para páginas sin preferencia: sin atributo `data-theme`, `@media (prefers-color-scheme: light)` aplica los tokens claros. La landing y auth se beneficiarán de esto sin sesión.
- **Acentos**: `[data-accent="blue|green|purple|red"]` sobrescriben los tokens de acento. Azul es el valor por defecto y conserva la identidad actual (`tensi-600`); verde, morado y rojo usan las escalas `emerald`, `violet` y `rose` del mockup.
- **Alto contraste**: `[data-contrast="high"]` refuerza `--color-fg*` y `--color-line*` en ambos temas (texto secundario más oscuro/claro y bordes más visibles).
- **Motion reducido**: `[data-motion="reduced"]` desactiva transiciones, animaciones y `scroll-behavior`; `@media (prefers-reduced-motion: reduce)` aplica lo mismo siempre, sin importar el atributo.
- **Densidad compacta**: `[data-density="compact"]` reduce los tokens de densidad `--density-card-padding`, `--density-row-padding`, `--density-gap` y `--density-section-gap`. Se exponen como `--spacing-card`, `--spacing-row`, `--spacing-gap` y `--spacing-section` para usarlos con utilidades canónicas (`p-card`, `py-row`, `gap-gap`, `space-y-section`). **No** se toca la escala global `--spacing`, ni tamaños de fuente, iconos o radios.
- **`color-scheme`** (`dark`/`light`) para scrollbars y controles nativos (selects, date pickers, autofill).
- **Refactor de `app/**`y`components/**`** para sustituir clases estructurales `slate-*`, `white` e `indigo-*` por los tokens semánticos, en dashboard, auth, landing, settings, profile, form, site y ui.
- **Gráficas Recharts** con `stroke`/`fill`/tooltip leyendo `var(--color-chart-*)`; se eliminan los hex fijos.
- **Tonos de categoría** (`components/ui/tone-classes.ts`, `Badge`, `BpRangesReference`, tablas y gráficas de análisis) con variantes legibles en claro y oscuro.
- **Mecanismo anti-FOUC**: script inline en el layout raíz (`next/script` con `strategy="beforeInteractive"`) que lee la cookie `tensi_appearance` y escribe los atributos en `<html>` antes del primer pintado. Sin cookie no escribe nada y manda `prefers-color-scheme`.
- **Núcleo portable** `lib/theme/core/appearance.ts`: tipos, defaults, parseo/serialización de la cookie y resolución de atributos, sin Next ni DOM.
- **Hook web** `lib/theme/hooks/use-appearance-attributes.ts`: aplica/quita los atributos en `document.documentElement` (lo consumirá SPEC 22 para la preview).
- **Espejo TypeScript** `lib/theme/tokens.ts` actualizado con los tokens semánticos, acentos y valores de ambos temas.
- **Verificación visual** de la matriz tema × acento × contraste × motion × densidad a 375 px y 1440 px.

**Out of scope (para specs futuras):**

- **Sección Apariencia** (`/dashboard/settings/appearance`), sus controles y su copy → **SPEC 22**.
- **Modelo, endpoints y persistencia en Nest** de las preferencias → **SPEC 22**.
- **i18n real** y traducción de la interfaz; el idioma solo se persiste en SPEC 22 y English queda deshabilitado.
- **Toggle rápido de tema** en el header del dashboard (icono sol del mockup). No se añade chrome nuevo.
- **Rediseño de la landing**: solo se adaptan colores y superficies; no cambian layout, copy ni estructura.
- **Tests automatizados de contraste** (no hay runner en el repo); se verifica con Playwright + axe y revisión manual.
- **Modo de alto contraste del sistema operativo** (`forced-colors`): no se implementa una variante específica.

## Modelo de datos

No hay base de datos ni cambios de contrato con la API en esta spec. El único estado es la cookie `tensi_appearance`, que **define y lee** esta spec y **escribe** SPEC 22.

```ts
// lib/theme/core/appearance.ts
export type ThemeMode = "dark" | "light" | "auto"
export type AccentColor = "blue" | "green" | "purple" | "red"
export type ContrastLevel = "normal" | "high"
export type MotionPreference = "full" | "reduced"
export type DensityPreference = "comfortable" | "compact"

export interface AppearanceValues {
  theme: ThemeMode
  accent: AccentColor
  contrast: ContrastLevel
  motion: MotionPreference
  density: DensityPreference
}

export const DEFAULT_APPEARANCE: AppearanceValues = {
  theme: "dark",
  accent: "blue",
  contrast: "normal",
  motion: "full",
  density: "comfortable"
}

export const APPEARANCE_COOKIE = "tensi_appearance"

/** Valor de cookie: "theme=light&accent=green&contrast=high&motion=reduced&density=compact". */
export function serializeAppearanceCookie(values: AppearanceValues): string

/** Campo inválido o ausente → default de ese campo (nunca lanza). */
export function parseAppearanceCookie(raw: string | undefined): AppearanceValues

/**
 * Atributos para `<html>`. `theme: "auto"` omite `data-theme` para que decida
 * `prefers-color-scheme`. `normal`/`full`/`comfortable` también se omiten: son
 * los valores por defecto del CSS.
 */
export function toAppearanceAttributes(values: AppearanceValues): {
  "data-theme"?: "light" | "dark"
  "data-accent"?: "green" | "purple" | "red"
  "data-contrast"?: "high"
  "data-motion"?: "reduced"
  "data-density"?: "compact"
}
```

Atributos válidos en `<html>`:

| Atributo        | Valores                                | Ausencia =             |
| --------------- | -------------------------------------- | ---------------------- |
| `data-theme`    | `light` \| `dark`                      | `prefers-color-scheme` |
| `data-accent`   | `blue` \| `green` \| `purple` \| `red` | `blue`                 |
| `data-contrast` | `normal` \| `high`                     | `normal`               |
| `data-motion`   | `full` \| `reduced`                    | `full`                 |
| `data-density`  | `comfortable` \| `compact`             | `comfortable`          |

Cookie: `Path=/`, `SameSite=Lax`, `Max-Age=31536000`, **no `HttpOnly`** (el script inline debe leerla) y `Secure` solo si `location.protocol === "https:"`. Contiene únicamente valores cosméticos; no hay PII.

### Tokens

Nombres de utilidad esperados (Tailwind v4, namespace `--color-*` y `--spacing-*`):

| Token CSS                 | Utilidades                     | Oscuro (default) | Claro     |
| ------------------------- | ------------------------------ | ---------------- | --------- |
| `--color-surface`         | `bg-surface`                   | `#030712`        | `#f8fafc` |
| `--color-card`            | `bg-card`, `bg-card/60`        | `#0f172a`        | `#ffffff` |
| `--color-card-muted`      | `bg-card-muted`                | `#1e293b`        | `#f1f5f9` |
| `--color-line`            | `border-line`                  | `#1e293b`        | `#e2e8f0` |
| `--color-line-strong`     | `border-line-strong`           | `#334155`        | `#cbd5e1` |
| `--color-fg`              | `text-fg`                      | `#f1f5f9`        | `#0f172a` |
| `--color-fg-muted`        | `text-fg-muted`                | `#94a3b8`        | `#334155` |
| `--color-fg-subtle`       | `text-fg-subtle`               | `#64748b`        | `#475569` |
| `--color-fg-inverted`     | `text-fg-inverted`             | `#020617`        | `#f8fafc` |
| `--color-focus`           | `ring-focus`                   | `#38bdf8`        | `#0284c7` |
| `--color-chart-grid`      | `var(--color-chart-grid)`      | `#1e293b`        | `#e2e8f0` |
| `--color-chart-axis`      | `var(--color-chart-axis)`      | `#64748b`        | `#64748b` |
| `--color-chart-tooltip`   | `var(--color-chart-tooltip)`   | `#0f172a`        | `#ffffff` |
| `--color-chart-systolic`  | `var(--color-chart-systolic)`  | `#fb7185`        | `#e11d48` |
| `--color-chart-diastolic` | `var(--color-chart-diastolic)` | `#38bdf8`        | `#0284c7` |

Acento (se sobrescribe por `[data-accent]`):

| Variante | Oscuro (`accent`) | Hover     | Claro (`accent`) | Hover     |
| -------- | ----------------- | --------- | ---------------- | --------- |
| `blue`   | `#0284c7`         | `#0ea5e9` | `#0284c7`        | `#0369a1` |
| `green`  | `#10b981`         | `#34d399` | `#059669`        | `#047857` |
| `purple` | `#8b5cf6`         | `#a78bfa` | `#7c3aed`        | `#6d28d9` |
| `red`    | `#f43f5e`         | `#fb7185` | `#e11d48`        | `#be123c` |

`--color-accent-soft` = acento al 10–12 % de opacidad; `--color-accent-line` = acento al 30–35 %; `--color-accent-fg` = `#ffffff` (o `#020617` si el acento claro no alcanza AA); `--color-accent-text` = variante del acento legible como texto sobre `--color-surface`.

Densidad:

| Token                    | Comfortable | Compact   |
| ------------------------ | ----------- | --------- |
| `--density-card-padding` | `1.5rem`    | `1rem`    |
| `--density-row-padding`  | `0.75rem`   | `0.5rem`  |
| `--density-gap`          | `1rem`      | `0.75rem` |
| `--density-section-gap`  | `2rem`      | `1.25rem` |

La densidad aplica **solo al contenido del dashboard** (páginas, tarjetas, tablas y listas). Landing y auth mantienen su espaciado.

## Plan de implementación

1. **Tokens base oscuros**: en `app/globals.css`, añadir los tokens semánticos con `@theme inline` mapeados a variables y los valores oscuros en `:root`; `color-scheme: dark`. Conservar los tokens de marca `tensi-*`. Verificación: la app se ve igual que antes de tocar nada (`pnpm dev` + captura de `/`, `/login`, `/dashboard`).
2. **Tema claro + fallback de sistema**: bloque `[data-theme="light"]` y `@media (prefers-color-scheme: light)` con `:root:not([data-theme])`. Verificación: en DevTools, alternar `document.documentElement.dataset.theme` y emular `prefers-color-scheme`; fondos, tarjetas y textos cambian.
3. **Acentos**: bloques `[data-accent="green|purple|red"]` con `accent`, `accent-hover`, `accent-soft`, `accent-line`, `accent-text` y `accent-fg` para ambos temas. Verificación: un botón y un enlace de prueba cambian de color con cada atributo.
4. **Contraste, motion y densidad**: `[data-contrast="high"]`, `[data-motion="reduced"]` (más `prefers-reduced-motion`), y los tokens `--spacing-card/row/gap/section` con `[data-density="compact"]`. Verificación: cada atributo produce el efecto esperado sin tocar fuentes ni iconos.
5. **Núcleo portable**: `lib/theme/core/appearance.ts` con tipos, defaults, parseo/serialización y `toAppearanceAttributes`. Verificación: `pnpm exec tsc --noEmit` y casos manuales (cookie vacía, campo inválido, `auto`).
6. **Script anti-FOUC**: componente `components/theme/appearance-script.tsx` con el script inline y montaje en `app/layout.tsx` con `next/script` + `beforeInteractive`. Verificación: con cookie `tensi_appearance=theme%3Dlight`, la primera pintura ya es clara (Playwright con cookie y captura antes de hidratar).
7. **Hook de atributos**: `lib/theme/hooks/use-appearance-attributes.ts` aplica/quita los cinco atributos y `color-scheme` en `document.documentElement`. Verificación: montarlo en una página de prueba temporal (o en SPEC 22) y comprobar que la UI reacciona.
8. **Primitivas**: refactorizar `components/ui/**` (`Card`, `Button`, `ButtonLink`, `Badge`, `Switch`, `AppLink`, `tone-classes`, `lock-badge`) y `components/form/**` a tokens semánticos. Verificación: formularios de auth y de nueva lectura legibles en ambos temas.
9. **Dashboard**: refactorizar `components/dashboard/**` (shell, sidebar, header, tarjetas, tablas, listas, formularios, gráficas) y aplicar `p-card`/`py-row`/`gap-gap`/`space-y-section` en los contenedores de contenido. Verificación: `/dashboard`, `/dashboard/history`, `/dashboard/new-reading`, `/dashboard/analytics` en claro y oscuro, 375/1440.
10. **Configuración y perfil**: refactorizar `components/settings/**` y `components/profile/**`, incluidos los cuatro bloques de Notificaciones y el editor de perfil. Verificación: `/dashboard/settings/*` en ambos temas.
11. **Auth, landing y chrome público**: refactorizar `components/auth/**`, `components/landing/**`, `components/site/**` (header, footer, modales, toasts), `app/(auth)/layout.tsx`, `app/page.tsx`, `app/error.tsx` y `app/not-found.tsx`. Verificación: landing y auth en claro/oscuro y con `prefers-color-scheme` claro.
12. **Gráficas**: sustituir hex por `var(--color-chart-*)` en `readings-trend-chart`, `analytics-category-evolution` y `analytics-period-averages`; tooltip con `background: var(--color-chart-tooltip)` y `border-color: var(--color-chart-tooltip-line)`. Verificación: ejes, grid y tooltip legibles en ambos temas.
13. **Espejo TypeScript**: actualizar `lib/theme/tokens.ts` con los tokens semánticos, acentos y valores de ambos temas. Verificación: `tsc` y revisión de que coincide con `globals.css`.
14. **Cierre**: matriz de Playwright (2 temas × 4 acentos × 2 contrastes × 2 motion × 2 densidades en las pantallas clave), axe sin violaciones serias de contraste, responsive 375/1440, `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build`.

## Criterios de aceptación

- [ ] `app/globals.css` define tokens semánticos de superficie, tarjeta, borde, texto, acento, foco y gráficas, y declara `color-scheme` para ambos temas.
- [ ] Sin atributo `data-theme` y con el sistema en claro, la landing y auth se pintan claras; con el sistema en oscuro, oscuras.
- [ ] `data-theme="light"` y `data-theme="dark"` fuerzan el tema en dashboard, auth, landing, settings, error y not-found.
- [ ] Los cuatro acentos cambian botones primarios, enlaces, foco, ítem activo del sidebar, switches y tarjetas seleccionadas; con verde, morado o rojo no queda azul estructural.
- [ ] `data-contrast="high"` aumenta el contraste de textos secundarios y bordes en ambos temas, y axe no reporta violaciones serias de contraste.
- [ ] `data-motion="reduced"` elimina transiciones y animaciones (toast, gráficas, hover) y `prefers-reduced-motion: reduce` produce el mismo efecto sin atributo.
- [ ] `data-density="compact"` reduce padding de tarjetas, filas de tablas y separación entre secciones del dashboard, sin encoger fuentes, iconos ni radios; landing y auth no cambian.
- [ ] Las tres gráficas del dashboard usan `var(--color-chart-*)` y son legibles en claro y oscuro (grid, ejes, tooltip y series).
- [ ] No quedan clases estructurales `slate-*`, `indigo-*` ni `text-white` en `app/**` y `components/**`; las excepciones documentadas son el thumb blanco del `Switch` y los degradados decorativos de marca (`tensi-*`) de landing/auth.
- [ ] Los tonos de categoría (óptima, normal, alta, crisis) son legibles en ambos temas y mantienen su significado.
- [ ] Con la cookie `tensi_appearance`, la primera pintura ya tiene el tema, acento, contraste, motion y densidad correctos, sin flash (verificado con Playwright antes de la hidratación).
- [ ] `lib/theme/core/**` no importa `next`, `next/*` ni `server-only`, y no usa `window`, `document` ni `localStorage`.
- [ ] El script anti-FOUC no rompe la CSP existente (`script-src 'self' 'unsafe-inline'`).
- [ ] Landing, login, registro, dashboard, historial, análisis, nueva lectura, configuración, perfil, toasts y modales son usables a 375 px y 1440 px en ambos temas, sin scroll horizontal ni errores de consola.
- [ ] `lib/theme/tokens.ts` refleja los mismos valores que `app/globals.css`.
- [ ] `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build` pasan.
- [ ] `git -C ../nest-tensi-api status --short` no muestra cambios (spec front-only).

## Decisiones

- **Sí:** variables CSS + atributos `data-*` en `<html>` en vez de un `ThemeProvider` con estado. Permite que el CSS decida, evita re-renderizados y hace posible el anti-FOUC con un script mínimo.
- **Sí:** tokens semánticos en vez de variantes `dark:` de Tailwind. Duplicar cada clase (`bg-white dark:bg-slate-950`) en 87 archivos es inmantenible; con tokens, el componente se escribe una vez.
- **Sí:** `prefers-color-scheme` como fallback en páginas públicas. Sin sesión no hay preferencia que aplicar y el sistema operativo es la señal correcta.
- **Sí:** la cookie `tensi_appearance` la define esta spec y la escribe SPEC 22. Separa el mecanismo (pintar) de la preferencia (persistir).
- **Sí:** cookie no `HttpOnly`. Solo contiene valores cosméticos y el script inline debe leerla; no hay riesgo de sesión.
- **Sí:** el acento azul conserva la identidad actual (`tensi-600`) en vez de saltar al `blue-600` del mockup; los otros tres siguen el mockup.
- **Sí:** densidad con tokens `--spacing-*` propios (`p-card`, `py-row`) en vez de tocar `--spacing` global. Cambiar la escala global encogería iconos, fuentes y radios y rompería la regla px÷4 del repo.
- **Sí:** motion reducido también con `prefers-reduced-motion`, no solo con el atributo. Es una preferencia de accesibilidad del sistema y debe respetarse siempre.
- **Sí:** Recharts acepta `var(--color-…)` en `stroke`/`fill`/estilos inline; no hace falta leer `getComputedStyle` ni duplicar la paleta en JS.
- **Sí:** el refactor es mecánico y por capas (primitivas → dashboard → settings → auth/landing), dejando la app funcional en cada paso.
- **No:** toggle de tema en el header del dashboard (no está en el alcance pedido y añade chrome nuevo).
- **No:** tests automatizados de contraste; no hay runner y se verifica con Playwright + axe.
- **No:** cambios en `nest-tensi-api`.

## Riesgos

| Riesgo                                                                  | Mitigación                                                                                                        |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| El refactor de 87 archivos deja pantallas a medio migrar                | Orden por capas con verificación visual en cada paso; el grep de clases estructurales es criterio de cierre.      |
| El tema claro revela contrastes insuficientes en textos secundarios     | Tokens `fg-muted`/`fg-subtle` ajustados por tema y revisión con axe en las pantallas clave.                       |
| El acento cambia el significado de colores de categoría (rojo = crisis) | Los tonos clínicos no usan `accent`; mantienen sus escalas semánticas propias.                                    |
| El script inline choca con la CSP                                       | La política actual ya permite `'unsafe-inline'` en `script-src`; se verifica en build de producción.              |
| Flash de tema en la primera carga                                       | Script `beforeInteractive` + cookie; se verifica con Playwright antes de la hidratación.                          |
| `@theme inline` con `var()` no genera utilidades de opacidad            | Se valida `bg-card/60` en el paso 1; si falla, se usan valores con `color-mix` explícito en los tokens.           |
| La densidad compacta se filtra a landing/auth                           | Los tokens de densidad solo se aplican en `components/dashboard/**` y `components/settings/**`.                   |
| Recharts ignora `var()` en algún prop                                   | Se verifica cada prop en ambos temas; si alguno falla, se resuelve con un mapa de colores por tema en el cliente. |
| Cambiar los tokens rompe la landing ya aprobada                         | La landing solo cambia de paleta, no de layout; se compara con los screenshots de `references/landing`.           |

## Qué **no** entra en esta spec

- La sección Apariencia, sus controles, su copy y el botón "Guardar Cambios".
- El modelo `AppearancePreference`, los endpoints `GET`/`PATCH /appearance/preferences`, la cookie escrita al guardar y la sincronización al iniciar sesión.
- Traducción de la interfaz o cambio real de idioma/formato de fecha.
- Un toggle rápido de tema en el header.
- Rediseño de landing o auth.
- Tests automatizados de contraste o e2e con base de datos.

Cada uno, si se implementa, va en su propia spec (SPEC 22 para la sección y la persistencia).
