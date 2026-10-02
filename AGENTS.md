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
