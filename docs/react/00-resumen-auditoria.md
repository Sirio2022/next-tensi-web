# Auditoría total — Buenas prácticas React 19 / Next.js 16

- **Fecha:** 2026-10-01
- **Alcance:** toda la aplicación (`app/`, `components/`, `lib/`, `proxy.ts`, `next.config.ts`, `app/globals.css`).
- **Método:** 4 sesiones de subagente `react-best-practices` repartidas por dominio (landing/site, auth/form, lib/hooks, app/config), cada una con su informe. Luego una verificación consolidada del conjunto (revisión del diff real, `lint`, `tsc`, `build` y E2E con Playwright contra el dev server).
- **Informes por área:**
  - `docs/react/01-landing-site.md` — `components/landing/*`, `components/site/*`
  - `docs/react/02-auth-form.md` — `components/auth/*`, `components/form/*`
  - `docs/react/03-lib-hooks.md` — `lib/auth/*`, `lib/bp/*`, `lib/query/*`, `lib/http/*`
  - `docs/react/04-app-config.md` — `app/*`, `proxy.ts`, `next.config.ts`, `app/globals.css`

## 1. Resumen ejecutivo

No se encontró **ningún incumplimiento de severidad alta**. La arquitectura App Router, las fronteras Server/Client, las reglas de hooks y el tipado estricto están correctos en todo el repo. Se detectaron **46 hallazgos** (0 alta / 12 media / 34 baja) y se aplicaron **12 correcciones seguras** en 10 archivos, sin alterar comportamiento, rutas ni API pública.

| Área | Alta | Media | Baja | Total | Aplicados | Informe |
| ---- | ---: | ----: | ---: | ----: | --------: | ------- |
| Landing / site | 0 | 3 | 10 | 13 | 6 | `01-landing-site.md` |
| Auth / form | 0 | 3 | 4 | 7 | 1 | `02-auth-form.md` |
| `lib/` | 0 | 2 | 10 | 12 | 3 | `03-lib-hooks.md` |
| App / config | 0 | 4 | 10 | 14 | 2 | `04-app-config.md` |
| **Total** | **0** | **12** | **34** | **46** | **12** | — |

## 2. Cambios aplicados (10 archivos)

| Archivo | Cambio | Severidad | Motivo |
| ------- | ------ | --------- | ------ |
| `lib/query/query-provider.tsx` | Patrón `makeQueryClient()` + `getQueryClient()` (singleton en navegador, cliente por render en server) | Media | TanStack advierte que React descarta el `QueryClient` creado con `useState` si el primer render suspende sin frontera de `Suspense`. |
| `lib/auth/auth-context.tsx` | `value` memoizado con `useMemo([user])` + `<AuthContext value={...}>` | Media / Baja | Evita re-render de todos los consumidores al recrear el objeto del contexto; usa la sintaxis de provider de React 19. |
| `components/site/toast.tsx` | `useRef<Set<number>>` de timers + `useEffect` de cleanup | Media | Cancela los `setTimeout` vivos si el provider se desmonta. |
| `app/layout.tsx` | `export const viewport: Viewport = { themeColor: '#030712' }` | Media | `themeColor` ya no vive en `metadata` (Next 15+). |
| `app/(auth)/layout.tsx` | `export const metadata = { robots: { index: false, follow: false } }` | Media | Las rutas de auth no deben indexarse. |
| `components/landing/bp-calculator.tsx` | Eliminado `useId()`/`id` muerto + `aria-atomic="true"` en la región `aria-live` | Baja | Limpieza y anuncio completo del panel de resultado. |
| `components/landing/hero.tsx` | `motion-reduce:animate-none` en el dot con `animate-ping` | Baja | Respeta `prefers-reduced-motion` en una animación infinita. |
| `components/site/site-header.tsx` | CTA/login de la barra usan `handleLogin`/`handleRegister` | Baja | Cierra el menú móvil al abrir el modal (antes quedaba abierto detrás). |
| `components/site/auth-modals.tsx` | `previouslyFocused.current?.focus?.()` → `?.focus()` | Baja | Optional chaining innecesario sobre un método siempre presente. |
| `components/auth/submit-button.tsx` | Eliminada la directiva `'use client'` | Baja | Componente sin hooks/APIs de navegador; solo se consume desde Client Components. |

> Las cuatro áreas modificaron archivos disjuntos: no hubo conflictos ni cambios cruzados entre sesiones.

## 3. Verificación consolidada ejecutada

| Comprobación | Comando | Resultado |
| ------------ | ------- | --------- |
| ESLint | `pnpm lint` | exit 0, sin warnings |
| TypeScript estricto | `pnpm exec tsc --noEmit` | exit 0 |
| Build de producción | `pnpm build` | ✓ 10/10 páginas (`/`, `/_not-found` estáticas; `/dashboard`, `/reset-password`, `/verify-account` dinámicas) |
| Dev server tras el build | `curl /` y `/dashboard` | `/` → 200; `/dashboard` → 307 `location: /login` (proxy OK) |
| E2E Playwright (7 rutas) | `/`, `/login`, `/register`, `/verify-account`, `/forgot-password`, `/reset-password`, `/dashboard` | 0 errores y 0 warnings de consola; sin errores de hidratación |
| Metadatos | Playwright en `/` y `/login` | `<meta name="theme-color" content="#030712">`; `viewport` por defecto preservado; `/login` con `robots=noindex, nofollow` |
| Calculadora (hooks + contexto) | Playwright, 150/95 mmHg | Muestra "Categoría estimada" e "hipertensión" (render de cliente OK) |
| Fix del menú móvil | Playwright a 700px | `aria-expanded` pasa de `true` a `false` al pulsar "Comenzar Gratis" y el modal abre |

## 4. Observaciones transversales (auditoría total)

- **Frontera Server/Client:** correcta y mínima en todo el repo. Server Components sin directiva donde no hay interactividad; `'use client'` solo en nodos con hooks/estado. Props serializables en todos los cruces.
- **`submit-button.tsx` sin `'use client'`:** seguro hoy (es presentacional, sin hooks, y sus 5 consumidores son Client Components). Nota para el futuro: si se importara directamente desde un Server Component pasaría a ser Server Component; renderiza igual porque no usa APIs de cliente.
- **`AuthContext value={...}`:** nueva sintaxis de provider de React 19; verificada por `tsc` contra `@types/react` 19.
- **`query-provider.tsx`:** cambio de comportamiento interno justificado por la doc oficial; conserva idénticos `defaultOptions`.
- **Sin anti-patrones React legacy** (`forwardRef`, `defaultProps`, refs string, `React.FC`, `any`, `dangerouslySetInnerHTML`) en ninguno de los archivos revisados.
- **Sin `<img>`** en la app: no aplica `next/image` (los gráficos son SVG inline con `aria-hidden`).

## 5. Recomendaciones pendientes priorizadas (no aplicadas)

Se dejaron sin aplicar por cambiar comportamiento, API pública, requerir archivos nuevos o ser decisión de producto/diseño. Orden sugerido:

1. **Robustez del App Router:** crear `app/error.tsx` / `app/global-error.tsx`, `app/not-found.tsx` y `(dashboard)/loading.tsx` (04 #3, #10).
2. **Accesibilidad de movimiento:** `@media (prefers-reduced-motion)` para la animación del toast y mover los `@keyframes` a `@theme` (04 #12/#13).
3. **Guarda de sesión en `(dashboard)/layout.tsx`** en vez de solo en la página (04 #8).
4. **SEO/metadatos:** `metadataBase` + `title.template` + OpenGraph/Twitter, y unificar títulos (04 #2).
5. **`typedRoutes: true`** en `next.config.ts` (bloqueado hoy por `router.push()` con template literals en los hooks de registro/forgot) (04 #11).
6. **`auth-header.tsx`**: botón "Cambiar tema" inerte → implementarlo o marcarlo `disabled`/"Próximamente" (02).
7. **`code-field.tsx`**: validar solo al completar los 6 dígitos (`shouldValidate: next.length === 6`) para evitar el error prematuro (02).
8. **`submit-button.tsx`**: patrón `aria-disabled` + guarda para no perder el foco al deshabilitar durante el envío (02).
9. **`auth-modals.tsx`**: sacar `mode` del `value` del contexto para no re-renderizar hero/header/CTA al abrir un modal (01).
10. **`toast.tsx`**: cierre manual/pausa (WCAG 2.2.1) — cruza con el punto 2 (01).
11. **`use-auth.ts`**: la invalidación de `['auth', 'session']` es un no-op (nadie registra esa query) (03).
12. **`lib/http/fetch-client.ts`**: timeout con `AbortSignal` y type guards en las respuestas (03).
13. **`lib/http/http.ts`**: `httpServer` no se usa y no es `server-only` (03).
14. **`lib/auth/types.ts`**: reexporta el valor `ApiError`; importarlo directo desde `@/lib/http/types` (03).

## 6. Estado del árbol de trabajo

10 archivos modificados + 4 informes nuevos (`docs/react/`). **No se hizo ningún commit.** `references/` se respetó como fuente de verdad del diseño: los cambios de copy/UX sugeridos quedaron como recomendación.
