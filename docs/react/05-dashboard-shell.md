# Revisión de buenas prácticas React 19 / Next.js 16 — Dashboard (shell y navegación)

- **Fecha:** 2026-10-02
- **Objetivo:** `app/(dashboard)/layout.tsx`, `app/(dashboard)/dashboard/page.tsx`, `components/dashboard/{dashboard-shell,dashboard-header,dashboard-sidebar,sidebar-nav-item,sidebar-brand,user-profile,plan-badge,upgrade-banner,upgrade-button}.tsx`, `lib/dashboard/nav.ts`
- **Alcance:** solo los 12 archivos listados. No se tocó ningún otro (en particular, no se modificaron `bp-ranges-reference.tsx`, `medical-disclaimer.tsx`, `empty-readings-card.tsx`, `components/ui/*` ni `lib/dashboard/bp-ranges.ts`, auditados en paralelo).
- **Método:** auditoría estática con checklist de React 19 / Next.js 16, contraste con las guías locales de la versión instalada (`node_modules/next/dist/docs/`) y verificación de cada recomendación con Context7 (`/vercel/next.js`, `/reactjs/react.dev`, `/tailwindlabs/tailwindcss.com`).
- **Referencias:**
  - Docs locales 16.3.7: `01-app/01-getting-started/03-layouts-and-pages.md`, `04-linking-and-navigating.md`, `05-server-and-client-components.md`, `06-fetching-data.md`, `10-error-handling.md`; tipos generados en `.next/types/{routes,validator}.d.ts`
  - Context7: `/vercel/next.js` (Server/Client boundary, serializable props, `loading.js`/streaming, DAL `verifySession`, "layouts y checks de auth"), `/reactjs/react.dev` (compilador vs memoización manual, `forwardRef` deprecado en React 19), `/tailwindlabs/tailwindcss.com` (`motion-reduce`)
  - Spec de referencia: `specs/dashboard/03-dashboard-free-layout-componentes.md` (Aprobado); mockup `references/dashboard/01-page/index.html`
  - Informes previos relacionados: `docs/react/04-app-config.md` (layout/página del dashboard)
- **Estado:** **Corregido** (2 cambios seguros aplicados; 12 mejoras descritas como recomendación por requerir archivos nuevos, cambio de API pública o decisión de producto).

## Resumen ejecutivo

El módulo es **sólido**: no hay incumplimientos de severidad Crítica ni Seria, y se confirmaron las fronteras Server/Client mínimas, la ausencia de anti-patrones legacy (sin `forwardRef`, `defaultProps`, refs string, `React.FC`, `any`, `dangerouslySetInnerHTML`) y el cumplimiento de las convenciones del repo (`Readonly<>` en todos los props, clases Tailwind canónicas, props serializables en todos los cruces).

- **Crítico:** 0
- **Serio:** 0
- **Moderado:** 3 (0 aplicados, 3 recomendaciones)
- **Menor:** 11 (2 aplicados, 9 recomendaciones)
- **Total:** 14 hallazgos · **Aplicados: 2**

| Severidad | Nº     | Aplicados | Solo recomendación |
| --------- | ------ | --------- | ------------------ |
| Crítico   | 0      | 0         | 0                  |
| Serio     | 0      | 0         | 0                  |
| Moderado  | 3      | 0         | 3                  |
| Menor     | 11     | 2         | 9                  |
| **Total** | **14** | **2**     | **12**             |

Conteo por archivo:

| Archivo                                      | Tipo de módulo                                | Hallazgos | Peor severidad |
| -------------------------------------------- | --------------------------------------------- | --------- | -------------- |
| `app/(dashboard)/layout.tsx`                 | Layout (Server Component, `async`)            | 1         | Moderado       |
| `app/(dashboard)/dashboard/page.tsx`         | Página (Server Component)                     | 2         | Menor          |
| `components/dashboard/dashboard-shell.tsx`   | Server Component                              | 1         | Menor          |
| `components/dashboard/dashboard-header.tsx`  | Server Component                              | 1         | Menor          |
| `components/dashboard/dashboard-sidebar.tsx` | Client Component                              | 4         | Moderado       |
| `components/dashboard/sidebar-nav-item.tsx`  | Client Component                              | 2         | Menor          |
| `components/dashboard/sidebar-brand.tsx`     | Server Component (dentro de frontera cliente) | **0**     | —              |
| `components/dashboard/user-profile.tsx`      | Server Component                              | **0**     | —              |
| `components/dashboard/plan-badge.tsx`        | Server Component                              | 1         | Menor          |
| `components/dashboard/upgrade-banner.tsx`    | Server Component                              | **0**     | —              |
| `components/dashboard/upgrade-button.tsx`    | Client Component                              | 1         | Menor          |
| `lib/dashboard/nav.ts`                       | Módulo de datos/tipos (compartido)            | 1         | Menor          |

> **Frontera Server/Client — correcta.** `layout.tsx` y `page.tsx` son Server Components; `dashboard-shell.tsx`, `dashboard-header.tsx`, `plan-badge.tsx`, `upgrade-banner.tsx`, `user-profile.tsx` y `sidebar-brand.tsx` no llevan `"use client"` (se renderizan en servidor), y la directiva solo aparece donde hay hooks/APIs de navegador (`dashboard-sidebar.tsx`, `upgrade-button.tsx`, `sidebar-nav-item.tsx`). Todos los props que cruzan la frontera son serializables (`AuthUser`, `Plan`, `ReactNode`); no se pasa ninguna función de servidor a cliente. La única función que cruza (`onLockedSelect`, `dashboard-sidebar.tsx:44`) lo hace de Client Component a Client Component, que es válido.

## Hallazgos

### Moderado

#### 1. `app/(dashboard)/layout.tsx:14` — la sesión bloquea todo el segmento antes de poder hacer streaming · **RECOMENDACIÓN (no aplicada)**

- **Ubicación:** `app/(dashboard)/layout.tsx:14` (`const user = await verifySession()`), junto a `lib/auth/dal.ts:17-19` (`cookies()` + `checkToken`, sin `cache` de datos de Next).
- **Problema:** el layout espera la llamada de red (`/api/auth/check-token`) antes de devolver el shell. Como el layout _es_ el que envuelve a la página, un `loading.tsx` en el mismo segmento monta su `<Suspense>` **dentro** del layout, así que no puede mostrar un fallback mientras se resuelve la sesión del propio layout. La navegación a `/dashboard` se queda sin UI hasta que responde la API.
- **Evidencia:** Context7 `/vercel/next.js`, _"Call unauthorized in a Suspense component during streaming"_ y _"Layouts and auth checks (why layouts can't protect children)"_ (`docs/01-app/02-guides/authentication.mdx`): recomendación de hacer el chequeo en un componente envuelto en `<Suspense>` para que el shell haga streaming mientras se resuelve la sesión. Doc local `04-linking-and-navigating.md` (loading UI de un segmento). Contexto: ya señalado en `docs/react/04-app-config.md` §#9 (sigue vigente).
- **Recomendación:** mantener el shell estático fuera del `await` y resolver el usuario dentro de un `<Suspense fallback={<DashboardSkeleton/>}>`, o bien mover el chequeo a la página y renderizar el header con datos resueltos en un límite suspendible. Requiere refactor de layout + archivos nuevos → no aplicado.

#### 2. `components/dashboard/dashboard-sidebar.tsx:26` — `useAuth()` completo solo para `logout` · **RECOMENDACIÓN (no aplicada)**

- **Ubicación:** `components/dashboard/dashboard-sidebar.tsx:26` (`const { logout } = useAuth()`).
- **Problema:** `useAuth()` (`lib/auth/hooks/use-auth.ts:29`) crea **siete** mutaciones de TanStack Query (`register`, `verify`, `resend`, `login`, `forgot`, `reset`, `logout`) más `useRouter`/`useQueryClient`, y arrastra `lib/auth/auth.api` al bundle del sidebar. El sidebar solo necesita `logout`. No es un re-render innecesario (no hay `value` de contexto nuevo), pero es peso y acoplamiento de cliente evitables.
- **Evidencia:** Context7 `/vercel/next.js`, _"Reducing JS bundle size"_ y _"Define an interactive Client Component leaf"_ (`05-server-and-client-components.mdx`): mantener los nodos cliente lo más pequeños posible.
- **Recomendación:** exponer un `useLogout()` (o `useAuthLogout`) que devuelva solo la mutación de logout y consumirlo en el sidebar y en un futuro `LogoutButton`. Cambia API pública de `lib/auth` (fuera de alcance) → no aplicado.

#### 3. No existe `app/(dashboard)/error.tsx` (ni `loading.tsx`) · **RECOMENDACIÓN (no aplicada)**

- **Ubicación:** `glob app/**/{error,loading,global-error}.tsx` = 0 resultados.
- **Problema:** si `verifySession()` lanza (p. ej. la API responde 5xx), el error propaga al 500 interno de Next y no hay frontera de error con el tema oscuro ni copy en español. Tampoco hay UI de carga para el segmento.
- **Evidencia:** Context7 `/vercel/next.js`, _"Stream page content with loading.js"_ y _"loading.js"_ (`03-api-reference/03-file-conventions/loading.mdx`): `loading.js` envuelve el segmento en un `<Suspense>` automáticamente; doc local `10-error-handling.md`. Ya listado en `docs/react/04-app-config.md` §#3 y §#10.
- **Recomendación:** crear `app/(dashboard)/error.tsx` (`"use client"`, prop `retry` desde Next 16.3) y `app/(dashboard)/loading.tsx` con tokens `slate`/`tensi`. Son archivos nuevos con decisión de copy/diseño → no aplicado.

### Menor

#### 4. `components/dashboard/plan-badge.tsx:17` — pulso infinito sin respetar `prefers-reduced-motion` · **APLICADO**

- **Ubicación:** `components/dashboard/plan-badge.tsx:17`.
- **Problema:** el punto del plan Premium usa `animate-pulse`, animación **infinita** de Tailwind, sin variante de reducción de movimiento. Aplica solo a Premium (hoy el plan de la spec es Free), pero es la misma clase de hallazgo que ya se corrigió en la landing (`hero.tsx`, informe 01 #4).
- **Evidencia:** Context7 `/tailwindlabs/tailwindcss.com`, _"Disable transitions using motion-reduce variant"_ y _"Supporting reduced motion"_ (`docs/animation.mdx`): usar `motion-reduce:*` para desactivar animaciones cuando el usuario pide movimiento reducido.
- **Corrección aplicada:** `animate-pulse bg-amber-400 motion-reduce:animate-none`. Sin impacto visual por defecto (variante `@media (prefers-reduced-motion: reduce)`), sin cambio de API.

#### 5. `components/dashboard/dashboard-sidebar.tsx:29-38` — landmarks `aside`/`nav` sin nombre accesible · **APLICADO**

- **Ubicación:** `components/dashboard/dashboard-sidebar.tsx:29` (`<aside>`) y `:38` (`<nav>`).
- **Problema:** los dos landmarks se exponen sin nombre. Con un único `nav` no es un fallo bloqueante, pero nombrar los landmarks mejora la navegación por regiones de lectores de pantalla y deja el patrón listo para cuando aparezcan más navegaciones (p. ej. un drawer móvil, hoy fuera de la spec).
- **Evidencia:** la propia guía de accesibilidad del repo usa `aria-label` en controles (`site-header.tsx:82`); doc local `03-architecture/accessibility.md` (landmarks). Tailwind/React no cambian; es un atributo ARIA estándar.
- **Corrección aplicada:** `aria-label="Barra lateral"` en el `<aside>` y `aria-label="Navegación principal"` en el `<nav>`. Sin cambio visual ni de comportamiento.

#### 6. `components/dashboard/dashboard-sidebar.tsx:43` — activo por igualdad exacta de ruta · **RECOMENDACIÓN (no aplicada)**

- **Ubicación:** `components/dashboard/dashboard-sidebar.tsx:43` (`active={item.href !== "#" && pathname === item.href}`).
- **Problema:** con las futuras pantallas hermanas de la spec (`/dashboard/history`, etc.) el ítem "Dashboard" dejaría de marcarse activo en sus subrutas. Hoy solo existe `/dashboard`, así que no hay bug.
- **Recomendación:** usar prefijo: `pathname === item.href || pathname.startsWith(`${item.href}/`)`. Cambia comportamiento en rutas aún inexistentes → no aplicado.

#### 7. `dashboard-sidebar.tsx:12-17` y `upgrade-button.tsx:7-11` — helper `scrollToUpgradeBanner` duplicado · **RECOMENDACIÓN (no aplicada)**

- **Ubicación:** `components/dashboard/dashboard-sidebar.tsx:12-17` y `components/dashboard/upgrade-button.tsx:7-11` (cuerpo idéntico).
- **Problema:** dos copias de la misma función de scroll (`getElementById("upgrade")?.scrollIntoView(...)`); cualquier cambio (p. ej. `behavior`) hay que hacerlo en dos sitios.
- **Recomendación:** extraer a `lib/dashboard/scroll-to-upgrade.ts` e importar en ambos. Crea un archivo nuevo fuera de los 12 del alcance → no aplicado.

#### 8. `components/dashboard/dashboard-header.tsx:17` — "Panel Principal" como `<p>` en vez de encabezado · **RECOMENDACIÓN (no aplicada)**

- **Ubicación:** `components/dashboard/dashboard-header.tsx:17`.
- **Problema:** el mockup lo marca como `<h2>` (`references/dashboard/01-page/index.html:328`); en el código es un `<p>`, así que no aparece en el outline de encabezados. Cambiarlo a `<h2>` introduciría un encabezado antes del `<h1>` de la página (`dashboard/page.tsx:35`), lo que exige valorar la jerarquía global.
- **Recomendación:** decisión de semántica/producto; si se hace, revisar el orden h1/h2 (quizá el `<h1>` debería vivir en el header y la página usar `<h2>`). No aplicado.

#### 9. `components/dashboard/sidebar-nav-item.tsx:1` — `"use client"` redundante · **RECOMENDACIÓN (no aplicada)**

- **Ubicación:** `components/dashboard/sidebar-nav-item.tsx:1`.
- **Problema:** su único consumidor (`dashboard-sidebar.tsx`) ya es Client Component, y el archivo no usa hooks ni APIs de navegador por sí mismo (solo recibe `onClick`/`onLockedSelect`). La directiva no reduce bundle (ya está en el grafo cliente por el padre), pero es una frontera explícita de más. Precedente: en la auditoría total se eliminó `'use client'` de `submit-button.tsx` por el mismo motivo (`docs/react/00-resumen-auditoria.md` §2).
- **Recomendación:** se puede eliminar; se deja porque documenta que el ítem es interactivo y permite renderizarlo desde cualquier punto del grafo cliente. No aplicado (decisión de estilo, sin impacto funcional).

#### 10. `components/dashboard/sidebar-nav-item.tsx:135-138` — `onLockedSelect` opcional deja el botón premium inerte · **RECOMENDACIÓN (no aplicada)**

- **Ubicación:** `components/dashboard/sidebar-nav-item.tsx:135-138` (`<button onClick={onLockedSelect}>`), con `onLockedSelect?: () => void` en `:119`.
- **Problema:** si un consumidor renderiza un ítem `requiresPremium` sin pasar `onLockedSelect`, el botón no hace nada y no hay aviso de tipo. Hoy el sidebar siempre lo pasa (`dashboard-sidebar.tsx:44`) y `DASHBOARD_SETTINGS_ITEM` no es premium, así que no ocurre.
- **Recomendación:** tipar la prop como unión discriminada (`{ item: PremiumItem; onLockedSelect: () => void } | { item: FreeItem; onLockedSelect?: never }`) o hacerla requerida cuando `requiresPremium`. Cambia la API del componente → no aplicado.

#### 11. `components/dashboard/dashboard-shell.tsx:31` — `<main>` sin `id`/skip-link · **RECOMENDACIÓN (no aplicada)**

- **Ubicación:** `components/dashboard/dashboard-shell.tsx:31`.
- **Problema:** no hay un enlace "saltar al contenido" ni `id` en `<main>`, útil con el sidebar largo (en móvil se apila arriba) para usuarios de teclado.
- **Recomendación:** añadir `id="main-content"` y un skip-link en el layout. Es un añadido de UI que debe validarse contra `references/` → no aplicado.

#### 12. `lib/dashboard/nav.ts:24,58` — datos de navegación mutables · **RECOMENDACIÓN (no aplicada)**

- **Ubicación:** `lib/dashboard/nav.ts:24` (`readonly DashboardNavItem[]`) y `:58` (`DASHBOARD_SETTINGS_ITEM`).
- **Problema:** el array es `readonly`, pero los objetos `DashboardNavItem` que contiene son mutables (`href`, `label`, `requiresPremium`), igual que `DASHBOARD_SETTINGS_ITEM`. Es configuración compartida module-level; mutarla afectaría a todos los renders.
- **Recomendación:** tipar los elementos como `Readonly<DashboardNavItem>` (`readonly Readonly<DashboardNavItem>[]`) para que el compilador impida mutaciones. Cambio solo de tipos, no aplicado para no ampliar el diff.

#### 13. `app/(dashboard)/dashboard/page.tsx:10-12` — sin `robots: { index: false }` · **RECOMENDACIÓN (no aplicada)**

- **Ubicación:** `app/(dashboard)/dashboard/page.tsx:10-12` (`export const metadata`).
- **Problema:** higiene SEO: el dashboard no debería indexarse. En la práctica no es rastreable (sin cookie, `proxy.ts` responde `307 /login`), pero declararlo es explícito. Ya señalado en `docs/react/04-app-config.md` §page.
- **Recomendación:** añadir `robots: { index: false }` (en la página o en el layout de `(dashboard)`). No aplicado (fuera del foco React; el layout puede ser el sitio adecuado).

#### 14. `app/(dashboard)/dashboard/page.tsx:62-67` — condicional ternaria con `null` · **RECOMENDACIÓN (no aplicada)**

- **Ubicación:** `app/(dashboard)/dashboard/page.tsx:62-67` (`{isFree ? (<>…</>) : null}`).
- **Problema:** cosmético; `isFree && (…)` o extraer el bloque Free a un componente es más legible. No hay impacto en rendimiento ni corrección.
- **Recomendación:** simplificar. No aplicado (sin beneficio funcional).

## Cambios aplicados

| Archivo                                      | Cambio                                                                                     | Línea final |
| -------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------- |
| `components/dashboard/plan-badge.tsx`        | `motion-reduce:animate-none` en el punto `animate-pulse` del plan Premium                  | 17          |
| `components/dashboard/dashboard-sidebar.tsx` | `aria-label="Barra lateral"` en `<aside>` y `aria-label="Navegación principal"` en `<nav>` | 29-38       |

`git diff` restringido a los archivos del alcance (el resto de diffs en el worktree son de otros archivos/auditorías; no se tocaron).

## Verificación ejecutada

| Comprobación               | Comando / evidencia                                          | Resultado                                                                                                                               |
| -------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| ESLint                     | `pnpm lint`                                                  | exit 0; único warning preexistente y ajeno al alcance (`components/site/auth-modals.tsx:181`)                                           |
| TypeScript estricto        | `pnpm exec tsc --noEmit`                                     | exit 0, sin errores                                                                                                                     |
| Clases canónicas           | `pnpm lint` (`better-tailwindcss/enforce-canonical-classes`) | `motion-reduce:animate-none` aceptada sin rewrite                                                                                       |
| Props read-only            | `pnpm lint` (`react/prefer-read-only-props`)                 | sin errores: los 9 componentes con props usan `Readonly<>`                                                                              |
| Tipos de layout            | `.next/types/validator.ts:117-124` + `routes.d.ts:6`         | `LayoutConfig<"/">` es el tipo esperado para el layout del route group `(dashboard)`; `LayoutProps<"/">` en `layout.tsx:13` es correcto |
| No se ejecutó `pnpm build` | —                                                            | Por indicación del orquestador (lo ejecuta al cierre, para no chocar con la auditoría paralela).                                        |

## No verificable

- **Streaming/`loading.tsx` (hallazgo #1 y #3):** no hay `loading.tsx` que probar y crear uno queda fuera del alcance; la ganancia real de FCP/estado de carga **no está medida** en esta sesión.
- **`useAuth()` completo en el sidebar (hallazgo #2):** no se midió el tamaño de bundle incremental del sidebar en el cliente; la observación es de acoplamiento/estructura, no de una métrica medida.
- **Lectores de pantalla:** el impacto de `aria-label` en `aside`/`nav` no se validó con VoiceOver/NVDA (no hay entorno de AT en la sesión); se apoya en el patrón ARIA estándar. La verificación de accesibilidad con navegador corresponde al subagente `accessibility-checker`.
- **Comportamiento responsive a 375px/1440px:** no se hizo E2E con Playwright en esta pasada (el shell no cambió visualmente: los dos cambios aplicados son un `@media (prefers-reduced-motion)` y atributos ARIA). La spec 03 ya lo verificó en `.playwright-mcp/`.
- **Rutas hermanas futuras (hallazgos #6, #10):** el comportamiento con `/dashboard/history` o ítems premium sin handler no existe aún y no es comprobable sin implementarlas.

## Anexo — qué se revisó y está correcto

- **Reglas de hooks:** los únicos hooks del alcance (`usePathname`, `useAuth` → `useOptionalAuthContext`/`useRouter`/`useQueryClient`/mutaciones) se llaman incondicionalmente en el cuerpo de `DashboardSidebar` (`dashboard-sidebar.tsx:25-26`). No hay hooks condicionales, en bucles ni tras `return` temprano. El `return null` de `UpgradeButton` (`upgrade-button.tsx:22`) es seguro: no hay hooks en ese componente.
- **Efectos:** ninguno de los 12 archivos usa `useEffect`. No hay sincronización props→estado ni efectos en cascada.
- **Estado y datos:** `isFree` (`page.tsx:27`) y `active` (`dashboard-sidebar.tsx:43`) se derivan en render; no hay estado duplicado. El fetching de sesión usa el DAL `verifySession` (Server Component + `cache()`), no `useEffect`+`useState`.
- **`verifySession()` repetido en layout y página — correcto, no es un bug:** Context7 `/vercel/next.js`, _"Layouts and auth checks"_ (`authentication.mdx`): _"…be cautious when doing checks in Layouts as these don't re-render on navigation… Instead, you should do the checks close to your data source or the component that'll be conditionally rendered."_ El chequeo del layout da UX (shell) y el de la página es la autorización real; `cache()` de React (`lib/auth/dal.ts:17`) deduplica la llamada dentro del render pass.
- **Serializabilidad:** `AuthUser`/`Plan` son objetos planos; `children` se pasa como slot renderizado en servidor. Ninguna función cruza la frontera servidor→cliente. El único callback (`onLockedSelect`) es cliente→cliente.
- **Memoización:** no se añadió ninguna. `nav.ts` es un módulo de constantes y `NAV_ICON` (`sidebar-nav-item.tsx:9-112`) es un `Record` module-level de elementos SVG estables — identidad constante sin `useMemo`. `scrollToUpgradeBanner` es module-level. No hay props inestables hacia componentes memoizados.
- **Keys:** `key={item.id}` (`dashboard-sidebar.tsx:41`), estable y única; no hay índices como `key` ni `Math.random()`.
- **Anti-patrones React 19:** sin `forwardRef` (Context7 React: _"In React 19, forwardRef is no longer necessary. Pass ref as a prop instead"_), sin `defaultProps`, refs string, `React.FC`, `any`, mutación de props/estado ni `dangerouslySetInnerHTML`.
- **Metadata:** la página exporta `metadata` en servidor (`page.tsx:10`); no se manipula `<head>` a mano.
- **Accesibilidad de interacción:** `type="button"` en los botones renderizados, `aria-current="page"` en el ítem activo (`sidebar-nav-item.tsx:152`), `aria-busy` + `disabled` en el logout (`dashboard-sidebar.tsx:56-57`), `aria-hidden="true"` en todos los SVG decorativos, `LockBadge` con `role="img"` + `aria-label` (`lock-badge.tsx:24-30`), y foco visible en todos los interactivos.
- **Clases Tailwind canónicas:** verificadas por `pnpm lint` con `better-tailwindcss/enforce-canonical-classes` (`size-9`, `size-96`, `size-1.5`, `bg-linear-to-*`, `text-xs/relaxed`, `h-75 w-150`, `z-*`, etc.); no hay px arbitrarios en la escala de espaciado.
- **Imágenes:** no hay `<img>` en el alcance; `next/image` no aplica (SVG inline con `aria-hidden`).
