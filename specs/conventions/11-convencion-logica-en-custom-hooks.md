# SPEC 11 — Lógica fuera de componentes: todo el estado en custom hooks

> **Status:** Aprobado
> **Depends on:** SPEC 06, SPEC 07, SPEC 10
> **Date:** 2026-10-04
> **Objective:** Establecer, documentar y forzar con ESLint que ningún componente ni página cliente contenga estado o lógica, moviendo todo a custom hooks en `lib/**/hooks/**` y toda derivación pura a módulos de `lib/`.

## Por qué existe esta spec

- La convención ya existe de facto (`lib/auth/hooks`, `lib/bp/hooks`, `lib/readings/hooks`) pero no está escrita ni forzada: hay 18 componentes cliente que todavía mezclan render con `useState`/`useEffect`/`useRef`/`useMemo`/`usePathname`/`useFormContext`/`useController` y helpers puros inline.
- Sin regla, cualquier cambio futuro vuelve a meter lógica en un componente y el patrón se degrada.
- Los componentes que aún tienen lógica concentran la difícil de testear: diálogos nativos, timers de toast, estado de formularios, wiring de React Hook Form y el input de código de 6 dígitos.
- La convención debe convivir con el resto de reglas del repo (SPEC 06 a11y, SPEC 07 `next/link`, props `Readonly<>`, clases canónicas), que ya se fuerzan con ESLint.

## Alcance

**In:**

- **Regla:** en `app/**` y `components/**`, y en `lib/**` salvo `lib/**/hooks/**`, queda prohibido importar/llamar hooks de estado/efecto/ref/reducer/memo/callback de React y hooks de lógica de terceros.
- **Ubicación:** todo custom hook vive en `lib/<dominio>/hooks/use-kebab.ts` (dominio), `lib/ui/hooks/` (comportamiento UI genérico) o `lib/form/hooks/` (campos), exportando `useCamelCase`.
- **Derivaciones puras a `lib/`:** formateadores, parsers, resolución de estado y cálculo de listas salen del componente como funciones de `lib/`.
- **Refactor de los 18 componentes cliente infractores** (tabla de abajo) sin cambiar comportamiento, UI ni accesibilidad.
- **Providers partidos:** `AuthProvider`, `ToastProvider` y `AuthModalsProvider` exponen el estado vía hook; el provider solo conecta el contexto y renderiza.
- **Enforcement ESLint** con `no-restricted-imports` (`error`) y `files`/`ignores` que fijan el allowlist de `lib/**/hooks/**`.
- **Documentación** de la regla en `AGENTS.md` y en los checklists de los agentes `react-best-practices` y `spec-verifier`.

**Out of scope (para specs futuras):**

- Server Components, `layout.tsx`, `page.tsx` y la capa `lib/**/dal.ts`: siguen leyendo y derivando en el servidor (no se pueden usar hooks en un Server Component `async`).
- Cualquier cambio visual, de UX o de copy.
- Reestructurar rutas, mover archivos por carpeta de dominio o renombrar DTOs.
- Migrar de React Hook Form, TanStack Query, zod o Context a otra librería (Zustand, Server Actions…).
- Tests automatizados: el repo no tiene runner. La verificación es lint/tsc/build + Playwright.
- Reglas de lint para derivaciones puras (no son forzables de forma fiable; se revisan a mano).

## Modelo de datos

No hay estructuras de dominio nuevas. Se crean módulos de hook y de helpers puros:

| Archivo                                            | Export                                                            | Extraído de                                                       |
| -------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| `lib/site/hooks/use-site-header.ts`                | `useSiteHeader()`                                                 | `components/site/site-header.tsx` (`menuOpen` + handlers)         |
| `lib/site/hooks/use-toasts.ts`                     | `useToasts()`                                                     | `ToastProvider` (lista + `showToast` + `dismiss`)                 |
| `lib/ui/hooks/use-toast-item.ts`                   | `useToastItem()`                                                  | `Toast` (pausa + timer)                                           |
| `lib/site/hooks/use-auth-modals-state.ts`          | `useAuthModalsState()`                                            | `AuthModalsProvider` (`mode` + acciones)                          |
| `lib/ui/hooks/use-native-dialog.ts`                | `useNativeDialog()`                                               | `Modal` y `EmergencyAlertDialog` (`showModal`, scroll lock, foco) |
| `lib/form/hooks/use-form-field.ts`                 | `useFormField<T>(name)`                                           | `components/form/form-field.tsx`                                  |
| `lib/form/hooks/use-password-field.ts`             | `usePasswordField<T>(name)`                                       | `components/form/password-field.tsx`                              |
| `lib/form/hooks/use-code-field.ts`                 | `useCodeField<T>(options)`                                        | `components/form/code-field.tsx`                                  |
| `lib/readings/hooks/use-new-reading-form.ts`       | `useNewReadingForm()`                                             | `components/dashboard/new-reading-form.tsx`                       |
| `lib/dashboard/hooks/use-active-nav-id.ts`         | `useActiveNavId()`                                                | `components/dashboard/dashboard-sidebar.tsx`                      |
| `lib/dashboard/hooks/use-reading-metric-field.ts`  | `useReadingMetricField(control, id)`                              | `ReadingMetricField`                                              |
| `lib/dashboard/hooks/use-reading-context-field.ts` | `useReadingContextField(control)`                                 | `ReadingContextField`                                             |
| `lib/auth/hooks/use-auth-provider.ts`              | `useAuthProvider(initialUser)`                                    | `lib/auth/auth-context.tsx`                                       |
| `lib/errors/hooks/use-error-report.ts`             | `useErrorReport(error)`                                           | los tres `error.tsx`                                              |
| `lib/format/percent.ts`                            | `formatPercent(ratio)`                                            | `formatConfidence` + `formatPercent` (duplicados)                 |
| `lib/auth/user.ts`                                 | `getUserInitials(user)`                                           | `getInitials`                                                     |
| `lib/dashboard/nav.ts` (extender)                  | `getActiveNavId(pathname)`, `preventPlaceholderNavigation(event)` | `dashboard-sidebar.tsx`, `sidebar-nav-item.tsx`                   |
| `lib/dashboard/reading-form.ts` (extender)         | `getMetricDefault(id)`                                            | `metricDefault`                                                   |
| `lib/dashboard/trend-points.ts`                    | `buildTrendPoints(readings)`                                      | `useMemo` de `readings-trend-chart.tsx`                           |
| `lib/readings/format.ts`                           | `formatReadingDateTime(date)`                                     | `dateTimeFormatter`                                               |
| `lib/readings/emergency.ts`                        | `isCrisisSeverity(severity)`                                      | `isCrisis`                                                        |
| `lib/readings/insight.ts`                          | `parseInsight(text)` → `InsightLine[]` (`{ text, bold }[]`)       | `parseLine` de `ai-insight-text.tsx`                              |

Firma de referencia del hook de diálogo compartido (lo consumen `Modal` y `EmergencyAlertDialog`):

```ts
// lib/ui/hooks/use-native-dialog.ts
export function useNativeDialog(
  options: Readonly<{
    open: boolean
    onClose: () => void
    returnFocusRef?: RefObject<HTMLElement | null>
  }>
): {
  dialogRef: RefObject<HTMLDialogElement | null>
  onCancel: (event: React.SyntheticEvent) => void
  onBackdropClick: (event: React.MouseEvent) => void
}
```

Frontera de lo prohibido vs. lo permitido en `app/**` y `components/**`:

- **Prohibido:** `useState`, `useEffect`, `useLayoutEffect`, `useRef`, `useReducer`, `useMemo`, `useCallback`, `useImperativeHandle`, `useSyncExternalStore`, `useTransition`, `useDeferredValue` (de `react`); `useForm`, `useFormContext`, `useController`, `useWatch`, `useFieldArray`, `useFormState` (de `react-hook-form`); `useRouter`, `usePathname`, `useSearchParams`, `useParams` (de `next/navigation`); `useQuery`, `useQueries`, `useMutation`, `useQueryClient`, `useInfiniteQuery` (de `@tanstack/react-query`).
- **Permitido:** `useId` y `useContext`; los `use*` propios importados de `lib/**/hooks/**`; funciones puras de `lib/`; condicionales de render, `map` con JSX y handlers que solo delegan (`onClick={openRegister}`, `onClick={scrollToUpgradeBanner}`).

## Plan de implementación

Todo el trabajo es en `next-tensi-web`. Cada paso deja el sistema funcional y es commitable.

1. **Formularios.** Crear `lib/form/hooks/use-form-field.ts`, `use-password-field.ts` y `use-code-field.ts`; refactorizar `form-field.tsx`, `password-field.tsx` y `code-field.tsx` para que solo rendericen. Verificación: toggle de contraseña y los 6 dígitos (teclear, flechas, Backspace, pegar) funcionan; `pnpm lint`/`tsc`.
2. **Diálogo nativo + shell de la web.** Crear `lib/ui/hooks/use-native-dialog.ts`; crear `lib/site/hooks/use-auth-modals-state.ts`, `use-toasts.ts`, `use-site-header.ts` y `lib/ui/hooks/use-toast-item.ts`; refactorizar `auth-modals.tsx`, `toast.tsx`, `site-header.tsx` y `emergency-alert-dialog.tsx`. Verificación: abrir/cerrar modales (botón, Escape, backdrop), lock de scroll y retorno de foco; menú móvil; toast tras registro. `pnpm lint`/`tsc`.
3. **Dashboard y lecturas.** Crear `lib/readings/hooks/use-new-reading-form.ts`, `lib/dashboard/hooks/use-active-nav-id.ts`, `use-reading-metric-field.ts`, `use-reading-context-field.ts` y los helpers puros `lib/format/percent.ts`, `lib/auth/user.ts`, `lib/dashboard/trend-points.ts`, `lib/readings/format.ts`, `lib/readings/emergency.ts`, `lib/readings/insight.ts`; extender `lib/dashboard/nav.ts` y `lib/dashboard/reading-form.ts`; refactorizar `dashboard-sidebar.tsx`, `new-reading-form.tsx`, `reading-inputs.tsx`, `readings-trend-chart.tsx`, `user-profile.tsx`, `ai-analysis-card.tsx`, `readings-limit-card.tsx`, `ai-insight-text.tsx` y `sidebar-nav-item.tsx`. Verificación: item activo del sidebar, submit real + diálogo de emergencia, gráfica y su tabla accesible, historial; `pnpm lint`/`tsc`.
4. **Providers.** Crear `lib/auth/hooks/use-auth-provider.ts` y refactorizar `lib/auth/auth-context.tsx` para consumirlo. Confirmar que `lib/query/query-provider.tsx` no usa hooks de estado y no cambia. Verificación: sesión, avatar y logout siguen funcionando.
5. **Error boundaries.** Crear `lib/errors/hooks/use-error-report.ts` y refactorizar `app/error.tsx`, `app/(dashboard)/error.tsx` y `app/global-error.tsx`. Verificación: `retry` responde y el error sigue registrándose en consola.
6. **Enforcement ESLint.** Añadir a `eslint.config.mjs` un override con `files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}"]`, `ignores: ["lib/**/hooks/**"]` y `no-restricted-imports` (lista de la sección anterior). Verificación: un `useState` de prueba en un componente temporal dispara `error` (luego se elimina); `pnpm lint` limpio.
7. **Documentación.** Añadir la sección "Lógica y estado (custom hooks)" en `AGENTS.md` y la regla equivalente en `.opencode/agents/react-best-practices.md` y `.opencode/agents/spec-verifier.md`, con la ubicación, el allowlist y la exención de Server Components.
8. **Cierre.** Repasar `grep` de hooks vetados en `app/` y `components/`; pasar Playwright por landing, auth y dashboard (375/1440) comparando con `references/`; ejecutar `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build`.

## Criterios de aceptación

- [ ] `grep -rnE "use(State|Effect|Ref|Reducer|Memo|Callback|LayoutEffect|Pathname|Router|FormContext|Controller|Watch|Mutation|Query)\b" app components` no devuelve llamadas (solo aparecen `useId`/`useContext`).
- [ ] `eslint.config.mjs` tiene `no-restricted-imports` en `error` para `app/**`, `components/**` y `lib/**` salvo `lib/**/hooks/**`.
- [ ] Un `useState` de prueba en `components/__tmp_check/` dispara error de ESLint; el archivo temporal se elimina después.
- [ ] Todos los hooks del refactor viven en `lib/**/hooks/**` y exportan `useCamelCase` (archivos `use-kebab.ts`).
- [ ] `components/site/toast.tsx`, `components/site/auth-modals.tsx` y `lib/auth/auth-context.tsx` ya no importan hooks vetados; el estado vive en sus hooks de `lib/**/hooks/`.
- [ ] `form-field.tsx`, `password-field.tsx` y `code-field.tsx` solo renderizan; la lógica vive en `lib/form/hooks/`.
- [ ] No quedan helpers puros no triviales declarados en `app/**`/`components/**` (`getInitials`, `getActiveNavId`, `formatConfidence`, `formatPercent`, `metricDefault`, `isCrisis`, `parseLine`, `buildTrendPoints`, `preventPlaceholderNavigation`).
- [ ] Landing: abrir/cerrar los modales de login y registro funciona con botón, Escape y backdrop; el scroll se bloquea y el foco vuelve al disparador.
- [ ] Auth: el toggle de visibilidad de contraseña y el campo de 6 dígitos (teclear, flechas, Backspace y pegar) funcionan igual que antes.
- [ ] Dashboard: item activo del sidebar, submit de Nueva Lectura con análisis IA y diálogo de emergencia (Escape y retorno de foco) funcionan.
- [ ] Dashboard: la gráfica y su tabla `sr-only` siguen renderizando los mismos datos; el tooltip mantiene categoría y valores.
- [ ] Los tres `error.tsx` siguen registrando el error en consola y `retry` recarga el segmento.
- [ ] Playwright a 375px y 1440px sin scroll horizontal y sin errores de consola.
- [ ] `AGENTS.md`, `.opencode/agents/react-best-practices.md` y `.opencode/agents/spec-verifier.md` documentan la convención.
- [ ] `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build` pasan.
- [ ] `git -C ../nest-tensi-api status --short` sigue limpio (el back no se toca).

## Decisiones

- **Sí:** la regla aplica a Client Components; los Server Components siguen leyendo vía `lib/**/dal.ts` porque no admiten hooks.
- **Sí:** los hooks viven en `lib/**/hooks/**` (`lib/<dominio>/hooks`, `lib/ui/hooks`, `lib/form/hooks`), no colocados junto al componente.
- **Sí:** las derivaciones puras van a funciones de `lib/`, no a hooks artificiales.
- **Sí:** los tres providers se parten en hook de estado + provider presentacional.
- **Sí:** enforcement con `no-restricted-imports` en `error`, coherente con SPEC 06/07/09.
- **Sí:** `useId` y `useContext` quedan permitidos (render y consumo puro; `createContext` no es un hook).
- **Sí:** `lib/query/query-provider.tsx` no se toca: usa un cliente a nivel de módulo, sin hooks de estado.
- **Sí:** `upgrade-button.tsx` no necesita hook: solo delega a `scrollToUpgradeBanner` y a una condición de plan trivial.
- **No:** lint para derivaciones puras; no es fiable y generaría falsos positivos.
- **No:** mover la carga de datos del servidor al cliente para "poder usar un hook".
- **No:** Zustand ni cambios de librería de formularios/datos.

## Riesgos

| Riesgo                                                                     | Mitigación                                                                                                        |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Refactor amplio (18 componentes) con riesgo de regresión visual o de foco  | Cambios que preservan comportamiento; un dominio por paso con `lint`/`tsc` y smoke de Playwright al cierre        |
| El allowlist del lint deja fuera hooks legítimos en `lib/**`               | Acotar `ignores` a `lib/**/hooks/**` y ajustar con `eslint-disable` puntual y justificado si aparece un caso real |
| Partir los providers altera la identidad del `value` y re-renderiza de más | Mantener `useMemo` dentro del hook de estado, como hoy                                                            |
| Quitar `useMemo` de `readings-trend-chart` recalcula en cada render        | El array Free es ≤ 20 puntos; coste despreciable                                                                  |
| `no-restricted-imports` tropieza con `.tsx`/tipos reexportados             | Probar con el probe del criterio de aceptación antes de cerrar                                                    |
| El refactor toca `lib/readings/hooks` ya cubierto por SPEC 10              | No cambiar contratos ni firmas de `useCreateReading`; solo añadir hooks nuevos                                    |

## Qué **no** entra en esta spec

- Server Components, layouts, páginas y la capa `dal.ts`.
- Cambios visuales, de UX, de copy o de accesibilidad.
- Mover archivos entre carpetas de dominio o renombrar tipos/DTOs.
- Cambiar de librería de estado, formularios o datos.
- Tests automatizados con un runner nuevo.
- Reglas de lint para derivaciones puras.

Cada uno, si se implementa, va en su propia spec.
