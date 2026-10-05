# Verificación — SPEC 11 (Lógica fuera de componentes: custom hooks)

> **Spec:** `specs/conventions/11-convencion-logica-en-custom-hooks.md`
> **Fecha:** 2026-10-04
> **Estado del spec:** Aprobado
> **Resultado:** ✅ Todos los criterios verificados (16/16). Sin correcciones de código necesarias.

## Resumen

La convención está implementada y forzada: no queda lógica de estado en `app/**` ni
`components/**`, los 23 custom hooks viven en `lib/**/hooks/**` con el naming
`use-kebab.ts`/`useCamelCase`, el enforcement de ESLint bloquea hooks vetados y el
ciclo `lint`/`tsc`/`build` pasa limpio. Las pantallas de landing, auth y dashboard
conservan su comportamiento (modales, toggle de contraseña, código de 6 dígitos,
sidebar activo, submit + análisis IA, diálogo de emergencia, gráfica/tabla accesible y
error boundaries).

No se aplicó ninguna corrección: la implementación ya cumplía.

## Evidencia por criterio

| # | Criterio | Método | Resultado |
| - | -------- | ------ | --------- |
| 1 | Sin hooks vetados en `app`/`components` | `grep -rnE "use(State\|Effect\|Ref\|...)" app components` | Sin coincidencias (exit 1) |
| 2 | `no-restricted-imports` en `error` | Lectura de `eslint.config.mjs` (líneas 56–132): `files` app/components/lib, `ignores: ["lib/**/hooks/**"]`, 4 paths (`react`, `react-hook-form`, `next/navigation`, `@tanstack/react-query`) | OK |
| 3 | Probe `useState` dispara error y se elimina | `components/__tmp_check/probe.tsx` → `no-restricted-imports` error; archivo borrado; `pnpm lint` limpio | OK |
| 4 | Hooks en `lib/**/hooks/**` con naming correcto | 23 archivos verificados, todos `use-*.ts` y export `useCamelCase` | OK |
| 5 | `toast.tsx`, `auth-modals.tsx`, `auth-context.tsx` sin hooks vetados | Lectura + grep; solo `useId`/`useContext` (permitidos) | OK |
| 6 | `form-field.tsx`, `password-field.tsx`, `code-field.tsx` solo renderizan | Lectura de los 3 + sus hooks en `lib/form/hooks/` | OK |
| 7 | Sin helpers puros no triviales en `app`/`components` | Las referencias a `formatPercent`, `buildTrendPoints`, `preventPlaceholderNavigation`… son imports desde `lib/` | OK |
| 8 | Landing: modal login/registro (botón/Escape/backdrop, scroll lock, foco) | Playwright 1440: abre (`dialog[open]`, `overflow:hidden`), Escape cierra y devuelve foco a "Iniciar Sesión"; click en backdrop cierra y libera scroll | OK |
| 9 | Auth: toggle contraseña + código 6 dígitos | Playwright: `password`→`text` al pulsar `Mostrar contraseña` (label pasa a `Ocultar contraseña`); código: teclear `379` (auto-avance), Backspace, flechas, pegar `987654` (vía portapapeles real) rellenan los 6 dígitos | OK |
| 10 | Dashboard: sidebar activo, submit + IA, diálogo de emergencia | Playwright: `aria-current="page"` en Dashboard/Historial según ruta; submit 200/122 abre `dialog[role=alertdialog]`; Escape cierra y devuelve foco a "Agregar Lectura"; submit 118/76 genera análisis IA real | OK |
| 11 | Gráfica + tabla `sr-only` + tooltip | Playwright: chart SVG + tabla `sr-only` con 21 filas (20 mediciones + cabecera), columnas Sistólica/Diastólica/Categoría | OK |
| 12 | Tres `error.tsx` registran y `retry` recarga | Ruta temporal `app/tmp-err-verify/` que lanza en cliente: renderiza "Algo salió mal" + "Reintentar"; `console.error` recibe el error vía `useErrorReport`; `retry` re-ejecuta el segmento. Probe eliminado. Los 3 boundaries comparten `useErrorReport` | OK |
| 13 | 375px/1440px sin scroll horizontal ni errores de consola | Playwright: `scrollWidth === innerWidth` en landing y dashboard a ambas anchuras; consola solo con logs de HMR/devtools | OK |
| 14 | Documentación en AGENTS.md y agentes | `grep`: sección "Lógica y estado (custom hooks)" en `AGENTS.md`; SPEC 11 en `react-best-practices.md` y `spec-verifier.md` | OK |
| 15 | `lint`, `tsc`, `build` | `pnpm lint` exit 0; `pnpm exec tsc --noEmit` exit 0; `pnpm build` exit 0 (12/12 páginas) | OK |
| 16 | Back repo limpio | `git -C ../nest-tensi-api status --short` sin salida | OK |

## Artefactos Playwright

Generados en `.playwright-mcp/` (carpeta no commiteada):

- `spec11-login-modal-open.png` — modal de login abierto.
- `spec11-login-modal-fresh.png` — modal de login fresco (verificación actual).
- `spec11-landing-375.png`, `spec11-landing-1440.png` — landing responsive.

## Notas

- El servidor de desarrollo previo (PID 43910) no detectaba rutas nuevas de primer nivel;
  se reinició para la prueba de error boundaries. Al cierre no se deja ningún proceso de
  verificación activo.
- La prueba de error boundaries requirió una ruta temporal (`app/tmp-err-verify/`) que
  violaba temporalmente la regla de la propia spec (usaba `useState`); fue eliminada y
  `git status` quedó limpio.
- El tooltip del gráfico se apoya en el componente ya existente; la tabla `sr-only`
  contiene los mismos 20 registros que alimentan `buildTrendPoints`.
