# Revisión de buenas prácticas React 19 / Next.js 16 — Contenido del dashboard y primitivas UI

- **Fecha:** 2026-10-02
- **Objetivo:** `components/dashboard/{bp-ranges-reference,medical-disclaimer,empty-readings-card}.tsx`, `components/ui/{button,badge,card,lock-badge}.tsx` y `lib/dashboard/bp-ranges.ts`
- **Alcance:** solo los 8 archivos listados. No se modificó ningún otro archivo.
- **Referencias:** React 19.2.8 + Next.js 16.3.7 (App Router) + Context7 (`/react/react`, `/vercel/next.js`) + docs locales `node_modules/next/dist/docs/`.
- **Estado:** **Corregido** (1 cambio seguro aplicado; el resto queda como recomendación por afectar API pública de primitivas, semántica a11y o decisiones de producto/spec).

## Resumen ejecutivo

El bloque está muy bien: los 8 módulos son **Server Components / utilidades puras sin `"use client"`**, no hay estado, efectos ni hooks, las listas usan `key` estables (nunca índices), las constantes de clases se declaran a nivel de módulo (no se recrean en cada render) y **no aparece ningún anti-patrón legacy** (`forwardRef`, `defaultProps`, refs string, `React.FC`, `any`, `dangerouslySetInnerHTML`, mutación de props). Todos los props se envuelven en `Readonly<>` y no se cruza ningún valor no serializable por la frontera Server/Client.

| Severidad | Nº    | Aplicados | Solo recomendación |
| --------- | ----- | --------- | ------------------ |
| Crítico   | 0     | 0         | 0                  |
| Serio     | 0     | 0         | 0                  |
| Moderado  | 2     | 1         | 1                  |
| Menor     | 5     | 0         | 5                  |
| **Total** | **7** | **1**     | **6**              |

Conteo por archivo:

| Archivo                                        | Tipo de módulo          | Hallazgos | Peor severidad |
| ---------------------------------------------- | ----------------------- | --------- | -------------- |
| `components/ui/button.tsx`                     | Primitiva (Server-safe) | 1         | Moderado       |
| `components/dashboard/bp-ranges-reference.tsx` | Server Component        | 3         | Moderado       |
| `components/dashboard/empty-readings-card.tsx` | Server Component        | 2         | Moderado       |
| `components/ui/badge.tsx`                      | Primitiva (Server-safe) | 1         | Menor          |
| `components/ui/card.tsx`                       | Primitiva (Server-safe) | 1         | Menor          |
| `components/ui/lock-badge.tsx`                 | Primitiva (Server-safe) | 1         | Menor          |
| `lib/dashboard/bp-ranges.ts`                   | Utilidad / datos        | 1         | Menor          |
| `components/dashboard/medical-disclaimer.tsx`  | Server Component        | **0**     | —              |

> `components/dashboard/medical-disclaimer.tsx` **no tiene problemas**: Server Component 100 % estático, SVG decorativo con `aria-hidden="true"` (`:13`), `role="note"` correcto y copy en español.

## Hallazgos

### Moderado

#### 1. `button.tsx` — `Button` (primitiva reutilizable) no aceptaba `ref` · **APLICADO**

- **Ubicación:** `components/ui/button.tsx:20-27` y `:34-45` (antes del cambio).
- **Problema:** `ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>`, y ese tipo **no incluye `ref`**. Por tanto `<Button ref={miRef} />` ni compilaba ni llegaba al `<button>`. En React 19 el `ref` es una prop normal y las primitivas reutilizables deben exponerlo así, sin `forwardRef`. Es una limitación real de la primitiva (consumidores futuros que necesiten foco/medición no pueden usarla).
- **Evidencia Context7:** `/react/react` — _"Function components receive ref as a regular prop"_ (`packages/react-reconciler/src/ReactFiberBeginWork.js`, `updateFunctionComponent` pasa `nextProps` completo a `renderWithHooks` sin eliminar `ref`) y _"Ref as a prop without forwardRef in React 19"_ (`updateForwardRef`: `'ref' is just a prop now`). Conexión JSX en `packages/react/src/jsx/ReactJSXElement.js` (`props.ref` como fuente de verdad).
- **Corrección aplicada:** se añadió `ref?: Ref<HTMLButtonElement>` a `ButtonProps`, se importa `type Ref` de React, se destructura `ref` y se pasa `ref={ref}` al `<button>` (`:1`, `:25-26`, `:40`, `:45`). Cambio **aditivo y no rompedor**: ningún consumidor actual pasa `ref`. No se usó `forwardRef`.

#### 2. `empty-readings-card.tsx` / `bp-ranges-reference.tsx` — salto de nivel de encabezado (`h1` → `h3`) · **RECOMENDACIÓN (no aplicada)**

- **Ubicación:** `components/dashboard/empty-readings-card.tsx:34`, `components/dashboard/bp-ranges-reference.tsx:17` (compartido con `components/dashboard/upgrade-banner.tsx:25`, fuera de alcance).
- **Problema:** la página define un único `<h1>Dashboard</h1>` (`app/(dashboard)/dashboard/page.tsx:35`) y las tarjetas saltan directamente a `<h3>`. No existe ningún `<h2>` en el dashboard, por lo que se salta el nivel 2 y se aplana el outline del documento (WCAG 1.3.1 / jerarquía de encabezados).
- **Recomendación:** usar `<h2>` en las tarjetas (las clases Tailwind están en el propio elemento, así que **no cambia el diseño**). **No aplicado** para no divergir de `upgrade-banner.tsx`, que está en el alcance del otro subagente; conviene hacerlo de forma coordinada (o vía la auditoría de a11y).

### Menor

#### 3. `badge.tsx` / `card.tsx` / `lock-badge.tsx` — primitivas sin atributos nativos (`...rest`) · **RECOMENDACIÓN (no aplicada)**

- **Ubicación:** `components/ui/badge.tsx:22-41`, `components/ui/card.tsx:11-37`, `components/ui/lock-badge.tsx:1-41`.
- **Problema:** las tres primitivas declaran una lista cerrada de props y **no extienden `HTMLAttributes`** ni hacen spread de `...rest`. No aceptan `aria-*`, `data-*`, `title`, `role`, `ref`, etc. `Card` solo admite `id` manualmente. Como primitivas reutilizables, esto limita la composición y obliga a envoltorios cuando un consumidor necesita un atributo nativo.
- **Recomendación:** ampliar los props con `HTMLAttributes<HTMLElement>` (y `ref`) y hacer `{...rest}` sobre el nodo raíz, manteniendo `tone`/`className`/`children` como props propias. **No aplicado**: es una ampliación de la API pública sin consumidores que hoy la necesiten; el cambio supera el "arreglo mínimo".

#### 4. `bp-ranges-reference.tsx` — mapa `tone` → clases duplicado de `badge.tsx` · **RECOMENDACIÓN (no aplicada)**

- **Ubicación:** `components/dashboard/bp-ranges-reference.tsx:3-10` vs `components/ui/badge.tsx:12-20`.
- **Problema:** las 6 variantes de `BpRangeTone` reimplementan las mismas clases que `BadgeTone` (que añade `neutral`). Además divergen: `amber` es `text-amber-400` en `Badge` y `text-amber-300` en la referencia (`bp-ranges-reference.tsx:7` vs `badge.tsx:14`). No hay una fuente única de la paleta de tonos, lo que invita a que se desincronicen al añadir/cambiar un tono.
- **Recomendación:** extraer un mapa compartido (p. ej. `lib/dashboard` o `components/ui/tone-classes.ts`) consumido por `Badge` y por la tabla de rangos. **No aplicado** por ser refactor de fuente única, no un arreglo puntual.

#### 5. `lib/dashboard/bp-ranges.ts` — `categories` no tiene ningún consumidor · **RECOMENDACIÓN (no aplicada)**

- **Ubicación:** `lib/dashboard/bp-ranges.ts:12-18` (tipo) y `:26-67` (las 6 entradas).
- **Problema:** `categories: readonly BpCategory[]` se documenta como el vínculo con la fuente única de categorías, pero **nadie lo lee** en todo el repo (verificado: `grep -rn "\.categories\|BpRangeDisplay"` solo encuentra la declaración y el `.map` de render, que usa `label`/`range`/`tone`). A nivel de tipos el vínculo con `BpCategory` ya existe por el propio tipo, así que el array es peso muerto en runtime hasta que se consuma.
- **Recomendación:** o consumirlo (p. ej. para validar/derivar la tabla), o retirarlo y dejar el vínculo solo en los tipos. **No aplicado** porque la SPEC 03 lo define explícitamente como parte del modelo (`specs/dashboard/03-...md:74-83`).

#### 6. `empty-readings-card.tsx` — CTA interactivo sin acción · **RECOMENDACIÓN (no aplicada)**

- **Ubicación:** `components/dashboard/empty-readings-card.tsx:42-44`.
- **Problema:** `<Button tone="gradient">Agregar mi primera medición</Button>` es un control enfocable y pulsable que hoy no hace nada (ni `onClick`, ni `href`, ni `disabled`). Es una promesa de interacción vacía para teclado/lector de pantalla.
- **Recomendación:** mientras la integración no exista, `disabled` (con nota visual) o convertirlo en un `<Link>` a la ruta de "Nueva Lectura" cuando se implemente. **No aplicado**: la doc del propio componente lo asume ("El CTA aún no tiene acción", `:6`) y la SPEC 03 lo deja fuera de alcance. Decisión de producto.

#### 7. `bp-ranges-reference.tsx` — grilla de rangos sin semántica de lista/tabla · **RECOMENDACIÓN (no aplicada)**

- **Ubicación:** `components/dashboard/bp-ranges-reference.tsx:25-35`.
- **Problema:** los 6 rangos se renderizan como `<div>` en un grid. Es información tabular (etiqueta + rango) presentada sin estructura semántica, lo que dificulta la navegación por lector de pantalla (no se anuncia "lista de 6 elementos" ni relación cabecera/valor).
- **Recomendación:** si se quiere mejorar a11y sin tocar el layout, usar `<ul>`/`<li>` (Tailwind preflight ya resetea `margin`/`padding`/`list-style`) o directamente una `<table>`. **No aplicado** por ser cambio de markup/semántica y no un arreglo de React; encaja mejor en la auditoría de a11y.

## Cambios aplicados

| Archivo                    | Cambio                                                                                                               | Línea final      |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `components/ui/button.tsx` | `import type { … Ref }` + `ref?: Ref<HTMLButtonElement>` y `ref={ref}` en el `<button>` (React 19, sin `forwardRef`) | 1, 25-26, 40, 45 |

`git diff` acotado al cambio propio (el resto de diffs en el worktree son los ~63 archivos de reformateo ajenos a esta revisión):

```diff
-import type { ButtonHTMLAttributes, ReactNode } from "react"
+import type { ButtonHTMLAttributes, ReactNode, Ref } from "react"
@@ interface ButtonProps …
   children: ReactNode
+  /** `ref` como prop normal (React 19); no se usa `forwardRef`. */
+  ref?: Ref<HTMLButtonElement>
@@ export function Button({
   children,
+  ref,
   ...rest
@@ <button
+      ref={ref}
       type={type}
```

## Verificación ejecutada

| Comprobación                 | Comando / evidencia                                                                                                            | Resultado                                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| ESLint (solo alcance)        | `pnpm exec eslint <los 8 archivos>`                                                                                            | exit 0, 0 errores / 0 warnings                                                                                        |
| ESLint (repo completo)       | `pnpm lint`                                                                                                                    | exit 0, 1 warning preexistente en `components/site/auth-modals.tsx:181` (fuera de alcance; ya documentado en SPEC 03) |
| TypeScript estricto          | `pnpm exec tsc --noEmit`                                                                                                       | exit 0                                                                                                                |
| Consumidores de ref          | `grep -rn "<Button"` → `empty-readings-card.tsx:43`, `upgrade-button.tsx:26`, `upgrade-banner.tsx:36`, `dashboard/page.tsx:43` | ninguno pasa `ref`: el cambio es aditivo y no altera consumidores                                                     |
| Consumidores de `categories` | `grep -rn "\.categories\|BpRangeDisplay\|BpRangeTone"`                                                                         | sin lectores de `categories` (hallazgo 5)                                                                             |
| Fronteras `"use client"`     | `grep -l "use client"` sobre los 8 archivos                                                                                    | ninguno: los 8 son Server-safe/utilidades                                                                             |

> No se ejecutó `pnpm build` por indicación del orquestador (evitar choques con el subagente paralelo que edita `app/(dashboard)/*`).

## No verificable / fuera de alcance

- **`pnpm build`:** no ejecutado por indicación explícita del orquestador; la verificación se limita a ESLint + `tsc`.
- **Comportamiento real con lectores de pantalla** de la jerarquía de encabezados, `role="note"` y `role="img"` del candado: no hay entorno de AT en esta sesión. Los hallazgos 2 y 7 se apoyan en criterios WCAG/ARIA estándar, no en una prueba con AT.
- **Beneficio de bundle/RSC de las recomendaciones 2–7:** al no aplicarse, no hay medición.
- **`components/dashboard/upgrade-banner.tsx`** (h3, `Card`, `Badge`) y el resto de `components/dashboard/*`/`app/(dashboard)/*`: en alcance del otro subagente; no se editaron. El hallazgo 2 se solapa con ese trabajo y debe coordinarse.
- **Lógica de categorización** (`lib/bp/bp-categories.ts`, `categorize()`): fuera del alcance; no se revisó.

## Anexo — qué se revisó y está correcto

- **Fronteras Server/Client:** ninguno de los 8 archivos lleva `"use client"`. `BpRangesReference`, `MedicalDisclaimer` y `EmptyReadingsCard` son Server Components estáticos (sin estado, handlers ni APIs del navegador); las 4 primitivas de `components/ui/` tampoco usan features client-only, por lo que se pueden renderizar desde el servidor o importar desde un Client Component (doc local `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md:186-190`). No cruza ninguna prop no serializable: los pocos props que se pasan (`tone`, `size`, `className`, `children`, `id`) son serializables (Context7 `/vercel/next.js`, _"Avoid non-serializable props across the client boundary"_, `use-client.mdx`; doc local `:298`). No se necesita `server-only` (no hay secretos ni I/O de servidor en estos módulos).
- **Hooks:** ninguno de los archivos usa hooks; no aplican reglas de hooks, dependencias de efectos, cleanups ni efectos en cascada.
- **Estado y datos:** `lib/dashboard/bp-ranges.ts` y las tablas de clases son datos/constantes **a nivel de módulo** (se crean una sola vez, fuera del render), evitando recreaciones por render. No hay estado duplicado ni derivable.
- **Keys:** la única lista (`bp-ranges-reference.tsx:26`) usa `key={entry.label}`, estable y única (`Hipotensión`, `Óptima`, `Normal`, `Normal Alta`, `Hipertensión 1`, `Hipertensión 2`); no se usa el índice ni `Math.random()`.
- **Memoización:** no se añadió ni falta `useMemo`/`useCallback`/`memo`. Sin React Compiler, los cambios de referencia no aplican (no se pasan objetos/arrays literales a componentes memoizados) y los `Record` de estilos son constantes de módulo.
- **Patrones React 19:** sin `forwardRef` (justo lo que se ha preservado al añadir `ref` como prop), sin `useActionState`/`useFormStatus` (no hay formularios aquí), sin `use()`, sin `React.FC`. La metadata del documento vive en la página (`app/(dashboard)/dashboard/page.tsx:10`), no en estos módulos.
- **Anti-patrones legacy:** no hay `defaultProps`, refs string, mutación de props/estado, `any`, `dangerouslySetInnerHTML`, `index` como `key`, ni claves inestables.
- **Readonly:** todos los componentes declaran `Readonly<Props>` (`button.tsx:42`, `badge.tsx:33`, `card.tsx:28`, `lock-badge.tsx:17`); los que no reciben props no lo necesitan. `react/prefer-read-only-props` no reporta nada.
- **Tailwind canónico:** las clases usan la escala numérica (`size-5`, `size-8`, `size-16`, `size-64`, `size-3.5`), `bg-linear-to-r`/`bg-linear-to-br`, `text-xs/relaxed`, `z-10`; `better-tailwindcss/enforce-canonical-classes` y `no-unnecessary-whitespace` pasan sin correcciones.
- **A11y básica:** SVGs decorativos con `aria-hidden="true"` (`medical-disclaimer.tsx:13`, `empty-readings-card.tsx:23`), candado con `role="img"` + `aria-label` y un `eslint-disable` justificado por no existir tag nativo equivalente (`lock-badge.tsx:22-30`), bloque decorativo con `aria-hidden` (`empty-readings-card.tsx:13`) y botón con `type="button"` por defecto para no someterse en formularios (`button.tsx:37`).
