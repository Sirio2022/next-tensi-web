<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Proyecto

App web de **Tensi** (presión arterial / salud cardiovascular). Hoy es en gran parte scaffolding de `create-next-app`; el alcance de UI previsto está definido por los mockups de `references/` (landing + autenticación).

## Stack y convenciones

- Next.js 16.3.7 (App Router) + React 19.2.8. Antes de escribir código lee las guías en `node_modules/next/dist/docs/` (ver bloque de arriba): esta versión tiene cambios rompientes.
- TypeScript en modo `strict`. El alias `@/*` apunta a la raíz del repo (`./*`), **no** a `src/`.
- Tailwind CSS v4 vía plugin de PostCSS (`@tailwindcss/postcss`). **No existe `tailwind.config.*`**; los tokens de tema se definen en `app/globals.css` con `@theme inline`.
- Gestor de paquetes: **pnpm 12.8.1** (campo `packageManager`). No usar npm ni yarn.
- Tipos de rutas generados: `layout.tsx`/`page.tsx` reciben tipos como `LayoutProps<"/">` o `PageProps<...>` desde `.next/types`. No los declares ni importes a mano; los regenera `next dev`/`next build`.

### Props de componentes (read-only)

- Todos los props de componentes se declaran **read-only** envolviéndolos con `Readonly<>`, tanto si el tipo es un objeto inline como una interfaz/alias:
  - `function Card({ title }: Readonly<CardProps>) { … }`
  - `function Provider({ children }: Readonly<{ children: ReactNode }>) { … }`
  - Tipos de ruta generados: `Readonly<LayoutProps<"/">>`, `Readonly<PageProps<'/login'>>`.
- Motivo: React trata los props como inmutables (los congela en desarrollo) y un componente nunca debe mutarlos. Marcarlos `Readonly` lo hace explícito en tipos y evita mutaciones accidentales (`props.x = …` deja de compilar).
- No hace falta repetir `readonly` en cada propiedad si envuelves el tipo completo con `Readonly<>`.
- Está forzada por la regla ESLint `react/prefer-read-only-props` (`error`) en `eslint.config.mjs`; `pnpm lint` falla si un componente no envuelve sus props en `Readonly<>`.

### Clases de Tailwind (forma canónica)

- Usa la **escala de espaciado numérica** en vez de valores arbitrarios en píxeles: `w-250` es 1000px y `h-87.5` es 350px. Regla: **píxeles ÷ 4**. En Tailwind v4 `--spacing` vale `0.25rem` (4px) y las utilidades numéricas (`w-*`, `h-*`, `p-*`, `m-*`, `size-*`, `gap-*`, `top-*`, `z-*`, …) multiplican ese valor; con root a 16px equivale a px/4.
- Lo fuerza la regla ESLint `better-tailwindcss/enforce-canonical-classes` (`error`, con `rootFontSize: 16`) configurada en `eslint.config.mjs`. Además de px÷4 aplica el resto de canonicalizaciones de Tailwind v4 (todas autofixables con `eslint --fix`):
  - `w-12 h-12` → `size-12`
  - `text-sm leading-relaxed` → `text-sm/relaxed`
  - `bg-gradient-to-r` → `bg-linear-to-r`
  - `z-[60]` → `z-60`
  - `flex-grow` → `grow`
- `better-tailwindcss/no-unnecessary-whitespace` evita espacios sobrantes dentro de la lista de clases.
- **No** se convierten los valores que no usan la escala de espaciado, que siguen siendo arbitrarios y son correctos: tamaños de fuente (`text-[10px]`), radios (`rounded-[10px]`), `blur-[140px]`, porcentajes (`top-[35%]`), `max-h-[90vh]`, colores/gradientes (`bg-[radial-gradient(...)]`).
- El plugin necesita `settings["better-tailwindcss"].entryPoint = "app/globals.css"` porque Tailwind v4 no tiene `tailwind.config.*` (los tokens viven en el CSS).

### Navegación (siempre `next/link`, nunca `<a>`)

- **Nunca uses etiquetas `<a>` en el JSX de la app.** Toda navegación se implementa con `next/link` (`import Link from "next/link"`).
- La regla es absoluta y cubre los tres casos:
  - Enlaces internos entre rutas (`<Link href="/login">`).
  - Enlaces externos (`<Link href="https://…">`) y `mailto:`.
  - Anclas de la misma página (`<Link href="#simulador">`), también las del nav del header.
- Motivo: `next/link` aporta prefetch, navegación cliente sin recarga y accesibilidad coherente; además funciona igual con URLs absolutas y con hash.
- Está forzada por ESLint en `eslint.config.mjs`: `@next/next/no-html-link-for-pages` (`error`) y `no-restricted-syntax` con el selector `JSXOpeningElement[name.name='a']`. `pnpm lint` falla si aparece un `<a>`.
- Con `typedRoutes` activo, los `href` con ancla (`#…`) son válidos como `Route`: el tipo generado por Next incluye `` `#${string}` `` (y `?${string}`), así que puedes usar el literal directamente (`<Link href="#simulador">`). No hace falta ningún helper.

### Lógica y estado (custom hooks)

- **Ningún componente ni página cliente contiene estado ni lógica.** Todo el estado de React (`useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`, …), el wiring de terceros (React Hook Form, TanStack Query, `next/navigation`) y las derivaciones puras no triviales viven fuera del componente.
- **Los custom hooks viven en `lib/**/hooks/**`** y exportan `useCamelCase` (archivo `use-kebab.ts`):
  - `lib/<dominio>/hooks/` — lógica del dominio (p. ej. `lib/readings/hooks/use-new-reading-form.ts`).
  - `lib/ui/hooks/` — comportamiento de UI genérico (p. ej. `lib/ui/hooks/use-native-dialog.ts`).
  - `lib/form/hooks/` — campos de formulario (p. ej. `lib/form/hooks/use-form-field.ts`).
- **Las derivaciones puras van a funciones de `lib/`**, no a hooks artificiales: formateadores (`lib/format/percent.ts`, `lib/readings/format.ts`), parsers (`lib/readings/insight.ts`), resolución de estado (`lib/readings/emergency.ts`, `lib/dashboard/nav.ts`) y cálculo de listas (`lib/dashboard/trend-points.ts`).
- **Los providers se parten**: un hook de estado (`lib/auth/hooks/use-auth-provider.ts`, `lib/site/hooks/use-toasts.ts`, `lib/site/hooks/use-auth-modals-state.ts`) + un provider presentacional que solo conecta el contexto y renderiza.
- **Permitido en `app/**` y `components/**`**: `useId` y `useContext`; los `use*` importados de `lib/**/hooks/**`; funciones puras de `lib/`; condicionales de render, `map` con JSX y handlers que solo delegan (`onClick={openRegister}`).
- **Exención de Server Components**: los Server Components (`layout.tsx`, `page.tsx` y la capa `lib/**/dal.ts`) siguen leyendo y derivando en el servidor, porque no admiten hooks. La regla aplica a los Client Components.
- Está forzada por ESLint en `eslint.config.mjs`: `no-restricted-imports` (`error`) sobre `app/**`, `components/**` y `lib/**`, salvo el allowlist `lib/**/hooks/**`. `pnpm lint` falla si un componente importa un hook vetado.

### Portabilidad web/Expo (`lib/**/core/**` + frontera de datos)

La web se prepara para que una futura app **React Native Expo** reutilice la lógica y, vía **DOM components** (`'use dom'`), los componentes web. Hay dos fronteras que respetar:

- **Capa portable `lib/**/core/**`** (convención nueva, hermana de `lib/**/hooks/**`): aquí vive lo reutilizable por web y Expo — tipos, esquemas zod, clientes `fetch`, helpers puros y hooks que **no** tocan Next ni el DOM.
  - El guard de ESLint la aísla: `no-restricted-imports` prohíbe `next`, `next/*` y `server-only`, y `no-restricted-globals` prohíbe `window`, `document` y `localStorage`. Un archivo de `lib/**/core/**` que los use falla `pnpm lint` (el guard también reaplica las restricciones de SPEC 11 en `core`).
  - **No** se mueve código existente de golpe: la migración a `core` es incremental, al tocar cada dominio.
- **Tokens de diseño**: `lib/theme/tokens.ts` es el **espejo en TypeScript** de los tokens de `app/globals.css` (`@theme inline`). Si cambias un color o la escala de espaciado, actualiza ambos; cuando exista Expo, el TS pasará a ser la fuente única.

#### Frontera de datos + vista portable

Los **Server Components no se pueden portar** a Expo, así que la regla es separar datos de vista:

- `page.tsx` es un **Server Component delgado**: resuelve datos con `verifySession()` (y la capa `lib/**/dal.ts`) y monta una **vista cliente presentacional** que recibe props. Nada de `next/headers` ni lectura de cookies dentro de la vista.
- La vista cliente no importa APIs de Next directamente: para navegar usa **`AppLink`** (`components/ui/app-link.tsx`), el único seam sobre `next/link`, de modo que el componente pueda portarse a DOM components sin cambios. `AppLink` reenvía todas las props de `next/link`, así que se usa igual (`href`, `className`, `children`, …).
- Las vistas **no portables** pueden seguir usando `next/link` mientras se migra cada dominio.

## Comandos

- `pnpm dev` — servidor de desarrollo en <http://localhost:3000>.
- `pnpm build` / `pnpm start` — build y arranque de producción.
- `pnpm lint` — ESLint (flat config en `eslint.config.mjs`).
- `pnpm exec tsc --noEmit` — typecheck (no hay script `typecheck`).
- No hay runner de tests ni script `test`.

## Estructura

- `app/` — rutas del App Router (`layout.tsx`, `page.tsx`, `globals.css`).
- `references/` — **fuente de verdad del diseño**: mockups HTML autocontenidos + screenshots de la landing (`01-landing`) y los flujos de auth (`auth/02-register`, `03-verify-account`, `04-login`, `05-forgot-password-request`, `06-reset-password`). Implementa las pantallas para que coincidan con estos mockups. Usan un build CDN de Tailwind con una paleta propia `tensi` (distinta del Tailwind de la app). El copy de UI está en español.
- `CLAUDE.md` — solo reexporta este archivo (`# @AGENTS.md`).

## Flujo de specs

Las features grandes pasan por skills locales en `.agents/skills/` (fijadas en `skills-lock.json`):

- `/spec` → escribe una spec numerada en `specs/<dominio>/NN-slug.md` (estado `Draft`), agrupada por dominio (`auth/`, `landing/`, …). La numeración es global entre todos los dominios.
- `/spec-impl NN-slug` → implementa **solo** specs en estado Approved/Aprobado, creando la rama `spec-NN-slug`.
- Las specs viven en `specs/<dominio>/` y `specs/.spec-config.yml` en `specs/` (se crean al primer uso). Nunca commits automáticos; nunca implementes una spec no aprobada.

## MCPs (globales)

Este proyecto usa dos MCP servers configurados globalmente en `~/.config/opencode/opencode.json`:

### context7

Usa Context7 para obtener documentación actualizada siempre que la tarea trate sobre una librería, framework, SDK, API, CLI o servicio cloud — incluso conocidos como React, Next.js, Prisma, Express o Tailwind. Esto cubre sintaxis de API, configuración, migración de versiones, debugging específico de librería, instrucciones de setup y uso de CLI. Úsalo incluso cuando creas saber la respuesta, y prefierelo a la búsqueda web para documentación.

No usar para: refactorizar, escribir scripts desde cero, debugging de lógica de negocio, code review o conceptos generales de programación.

### playwright

Usa el MCP de Playwright siempre que la tarea requiera manejar un navegador real: navegar URLs, hacer click, rellenar formularios, tomar snapshots/screenshots, inspeccionar el DOM/árbol de accesibilidad o verificar flujos de UI end-to-end. Prefierelo a `webfetch`/`websearch` cuando necesites renderizar páginas con JS o reproducir interacciones de usuario.

No usar para: lookups de documentación estática (usa context7), fetch simple de texto/HTTP o trabajo solo backend.

**Ubicación del output:** todos los artefactos del MCP de Playwright — screenshots, snapshots, traces, logs de consola, PDFs y cualquier otro archivo generado — DEBEN escribirse en la carpeta `.playwright-mcp/` del proyecto. Nunca disperses el output de Playwright por otras partes del repo. Esta carpeta es generada y no debe commitearse.

## Spec Driven Development (SDD) es el flujo de trabajo principal de este proyecto. Las features grandes se implementan siguiendo un ciclo de vida de specs

1. `/spec` → escribe una spec numerada en `specs/<dominio>/NN-slug.md` (estado `Draft`), agrupada por dominio. La numeración es global entre dominios.
2. `/spec-impl NN-slug` → implementa **solo** specs en estado Approved/Aprobado, creando la rama `spec-NN-slug`.
