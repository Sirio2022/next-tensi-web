# Revisión de buenas prácticas React 19 / Next.js 16 — Landing y shell del sitio

- **Fecha:** 2026-10-01
- **Objetivo:** `components/landing/{hero,features,cta,bp-calculator}.tsx` y `components/site/{site-header,site-footer,toast,auth-modals}.tsx`
- **Alcance:** solo los 8 archivos listados. No se modificó ningún otro archivo.
- **Referencias:** Next.js 16.3.7 (App Router) + React 19.2.8 + Context7 + docs locales `node_modules/next/dist/docs/`.
- **Estado:** **Corregido** (se aplicaron 6 cambios seguros; el resto queda como recomendación por afectar API pública, estructura de módulos o al mockup de `references/`).

## Resumen ejecutivo

La base está bien: las fronteras Server/Client son correctas y mínimas en su intención (2 Server Components puros, 6 Client Components con interactividad real), las `key` son estables, no hay anti-patrones legacy (`forwardRef`, `defaultProps`, refs string, `React.FC`, `any`, `dangerouslySetInnerHTML`), y los dos providers memoizan su `value` con justificación real.

| Severidad | Nº | Aplicados | Solo recomendación |
| --------- | -- | --------- | ------------------ |
| Alta      | 0  | 0         | 0                  |
| Media     | 3  | 1         | 2                  |
| Baja      | 10 | 5         | 5                  |
| **Total** | **13** | **6** | **7** |

Conteo por archivo:

| Archivo | Tipo de módulo | Hallazgos | Peor severidad |
| ------- | -------------- | --------- | -------------- |
| `components/landing/hero.tsx` | Client Component | 2 | Media |
| `components/landing/features.tsx` | Server Component | **0** | — |
| `components/landing/cta.tsx` | Client Component | 1 | Baja |
| `components/landing/bp-calculator.tsx` | Client Component | 2 | Baja |
| `components/site/site-header.tsx` | Client Component | 1 | Baja |
| `components/site/site-footer.tsx` | Server Component | 3 | Baja |
| `components/site/toast.tsx` | Client Component (provider) | 2 | Media |
| `components/site/auth-modals.tsx` | Client Component (provider) | 2 | Media |

> `components/landing/features.tsx` **no tiene problemas**: es Server Component (sin `"use client"`), 100 % estático, sin listas ni estado, y todos sus SVG decorativos llevan `aria-hidden="true"` (`features.tsx:13,31,47`).

## Hallazgos

### Media

#### 1. `toast.tsx` — timers sin cleanup · **APLICADO**

- **Ubicación:** `components/site/toast.tsx:53` (antes del cambio).
- **Problema:** `showToast` agendaba `window.setTimeout(() => dismiss(id), TOAST_DURATION_MS)` sin guardar el id ni cancelarlo. Todo toast deja un callback vivo hasta 3 s después de que el provider se desmonte, y no hay forma de cancelarlos en bloque.
- **Evidencia:** la doc oficial de React (Context7, `/react/react`, *"useDebouncedCallback – useRef-based timeout with useEffect cleanup"*, `react-reconciler/src/__tests__/useRef-test.internal.js`) define el patrón canónico: guardar el timeout en un `useRef` y `clearTimeout` en el cleanup del `useEffect`. React 19 ya no avisa de `setState` tras desmontar, pero el callback sigue ejecutándose.
- **Corrección aplicada:** `timers = useRef(new Set<number>())` + un `useEffect(() => { … clearTimeout … }, [])` de limpieza; cada timer se elimina del set al dispararse. Sin cambios de API ni de UI; sigue autodescartándose a los 3 s igual que el mockup (`references/01-landing/index.html:753-760`).

#### 2. `auth-modals.tsx` — `mode` dentro del `value` del contexto · **RECOMENDACIÓN (no aplicada)**

- **Ubicación:** `components/site/auth-modals.tsx:52-55`.
- **Problema:** `value` incluye `mode`, así que cada `openLogin`/`openRegister`/`close` produce un objeto nuevo y **re-renderiza todo el subárbol consumidor**. Pero ninguno de los consumidores lee `mode`: `Hero` (`hero.tsx:10`) y `SiteHeader` (`site-header.tsx:19`) solo destructuran `openLogin`/`openRegister`, y `Cta` (`cta.tsx:7`) solo `openRegister`. En esta pantalla eso significa re-renderizar hero + header + CTA (y su markup estático, que es la mayor parte del JS de la landing) al abrir un modal.
- **Evidencia:** Context7 `/react/react`, *"Provider value change detection and propagation"* (`packages/react-reconciler/src/ReactFiberNewContext.js`): `propagateParentContextChanges` compara `oldProps.value` con `Object.is` y marca a todos los consumidores del contexto para re-render. Al recrear el objeto, la comparación falla siempre.
- **Recomendación:** separar el contexto en dos (acciones estables vs. estado `mode`) o dejar `mode` fuera del `value` y exponerlo solo donde se use el `<Modal>` interno. **No aplicado** porque cambia la API pública de `useAuthModals()` (`AuthModalsContextValue`), fuera del alcance permitido.

#### 3. `hero.tsx` — frontera cliente más alta de lo necesario · **RECOMENDACIÓN (no aplicada)**

- **Ubicación:** `components/landing/hero.tsx:1` (`'use client'` en todo el archivo).
- **Problema:** el Hero es Client Component por dos botones (`hero.tsx:30-47`), pero ~80 de sus 100 líneas son markup estático (badge, `h1`, párrafo y la tarjeta mock del dashboard con tres métricas y el SVG de tendencia). Todo eso entra en el bundle de cliente sin necesitar interactividad.
- **Evidencia:** doc local `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md:188` — *"To reduce the size of your client JavaScript bundles, add `'use client'` to specific interactive components instead of marking large parts of your UI as Client Components"*; confirmado en Context7 `/vercel/next.js`, *"Reducing client bundle size — place 'use client' at leaf-level interactive components"* (`docs/01-app/01-getting-started/05-server-and-client-components.mdx`).
- **Recomendación:** extraer un componente cliente mínimo (p. ej. `components/landing/hero-cta.tsx` con los dos botones) y dejar `Hero` como Server Component. **No aplicado**: requiere crear archivos nuevos y cambia el module graph; se deja a decisión de arquitectura.

### Baja

#### 4. `hero.tsx` — animación infinita sin respetar `prefers-reduced-motion` · **APLICADO**

- **Ubicación:** `components/landing/hero.tsx:16`.
- **Evidencia:** `<span className="… animate-ping" />` — un `animate-ping` de Tailwind es una animación **infinita y en bucle**; no había variante `motion-reduce`. Criterio WCAG 2.3.3 (Animation from Interactions) / buenas prácticas de movimiento.
- **Corrección aplicada:** `motion-reduce:animate-none`. Sin impacto visual por defecto (variante `@media (prefers-reduced-motion: reduce)` generada por Tailwind v4).

#### 5. `bp-calculator.tsx` — `useId()` sin referencia (`id` muerto) · **APLICADO**

- **Ubicación:** `components/landing/bp-calculator.tsx:109` y `:179` (antes del cambio).
- **Problema:** `const ids = { sys: useId(), dia: useId(), pulse: useId(), result: useId() }`; el cuarto id solo se colocaba como `id={ids.result}` en el contenedor del resultado, pero **nada lo referencia** (no hay `aria-describedby`/`aria-labelledby`/`htmlFor` que lo use). Los tres primeros sí se usan correctamente (`htmlFor` ↔ `id` en `bp-calculator.tsx:132/136`, `147/151`, `162/166`).
- **Corrección aplicada:** eliminado el cuarto `useId` y el `id` del contenedor. Verificado que ningún test/script lo consulta (`grep result .playwright-mcp --include="*.mjs"` → sin coincidencias).

#### 6. `bp-calculator.tsx` — región `aria-live` sin `aria-atomic` · **APLICADO**

- **Ubicación:** `components/landing/bp-calculator.tsx:178-181`.
- **Problema:** el panel de resultado es una región `aria-live="polite"` con varios nodos (icono + "Categoría estimada:" + categoría + tag de bucket). Sin `aria-atomic`, el lector de pantalla puede anunciar solo el fragmento textual que cambió, perdiendo el contexto del panel.
- **Corrección aplicada:** `aria-atomic="true"` junto a `aria-live="polite"`. No se tocó la lógica de la calculadora (que vive en `useBpCalculator`, fuera del alcance).

#### 7. `site-header.tsx` — el CTA de la barra no cerraba el menú móvil · **APLICADO**

- **Ubicación:** `components/site/site-header.tsx:63` y `:70` (antes del cambio).
- **Problema:** los botones de la barra superior llamaban a `openLogin`/`openRegister` directamente, mientras que los del panel móvil usaban `handleLogin`/`handleRegister` (`site-header.tsx:22-30`), que además hacen `setMenuOpen(false)`. Al pulsar el CTA de la barra con el menú hamburguesa abierto (rango `sm`–`md`) el modal se abría dejando el menú abierto detrás.
- **Corrección aplicada:** los dos botones de la barra pasan a usar los handlers existentes. No cambia el comportamiento en escritorio (el menú siempre está cerrado allí) y elimina lógica duplicada.

#### 8. `toast.tsx` — toast autodescartable sin pausa ni cierre manual · **RECOMENDACIÓN (no aplicada)**

- **Ubicación:** `components/site/toast.tsx:65-69` y `:76-89`.
- **Problema:** el toast desaparece a los 3 s sin botón de cierre y sin pausar el temporizador al pasar el ratón o al enfocar. WCAG 2.2.1 (Timing Adjustable) pide que el contenido con límite de tiempo se pueda pausar/extender o desactivar.
- **Recomendación:** añadir un botón de cierre (y opcionalmente pausa en `hover`/`focus`). **No aplicado** porque el mockup de referencia tampoco tiene botón de cierre (`references/01-landing/index.html:741-761`) y `references/` es la fuente de verdad del diseño; el cambio es de producto/UX. Alternativa de bajo coste: subir `TOAST_DURATION_MS` o usar `role="status"` (equivalente a `aria-live="polite"` + `aria-atomic="true"`).

#### 9. `auth-modals.tsx` — `?.` innecesario sobre el método `focus` · **APLICADO**

- **Ubicación:** `components/site/auth-modals.tsx:158` (antes del cambio).
- **Problema:** `previouslyFocused.current?.focus?.()` — `focus` existe siempre en `HTMLElement`; el optional chaining sobre el método sugiere una posibilidad de `undefined` que no existe y oculta errores de tipo si el ref no fuera un elemento.
- **Corrección aplicada:** `previouslyFocused.current?.focus()`. Sin cambio de comportamiento.

#### 10. `cta.tsx` — Client Component por un único botón · **RECOMENDACIÓN (no aplicada)**

- **Ubicación:** `components/landing/cta.tsx:1`.
- **Problema:** igual que el punto 3, pero el archivo solo tiene 38 líneas; el coste real es bajo.
- **Recomendación:** si se refactoriza el Hero, extraer un único componente cliente de "CTA de registro" reutilizable por Hero y Cta. **No aplicado** (mismo motivo: crear archivos nuevos fuera del alcance).

#### 11. `site-footer.tsx` — jerarquía de encabezados de columna · **RECOMENDACIÓN (no aplicada)**

- **Ubicación:** `components/site/site-footer.tsx:39` y `:62`.
- **Problema:** "Enlaces" y "Desarrollado por" usan `<h2>` al mismo nivel que los `<h2>` de sección del `main` ("Calculadora de Presión Arterial", "¿Listo para comenzar?"), lo que aplana el outline del documento.
- **Recomendación:** bajarlos a `<h3>` (las clases Tailwind están en el propio elemento, así que no cambia el diseño). **No aplicado** para no tocar la semántica sin decisión previa.

#### 12. `site-footer.tsx` — año hardcodeado · **RECOMENDACIÓN (no aplicada)**

- **Ubicación:** `components/site/site-footer.tsx:97` — `© 2026 Tensi`.
- **Recomendación:** derivarlo (`new Date().getFullYear()`) el 1 de enero de 2027. En un Server Component estático se hornea en build, así que también valdría dejarlo fijo si se prefiere determinismo en el output.

#### 13. `site-footer.tsx` — `href="#"` en Términos y Privacidad · **RECOMENDACIÓN (no aplicada)**

- **Ubicación:** `components/site/site-footer.tsx:44` y `:49`.
- **Problema:** son enlaces que llevan al top de la página; con teclado/lector de pantalla parecen navegables pero no lo son.
- **Recomendación:** cuando existan las rutas, usar `next/link`; mientras tanto, renderizarlos como texto no interactivo. **Fuera de alcance por SPEC 02** ("Páginas de Términos y Privacidad … Out of scope") y presente igual en el mockup, por lo que no se aplicó.

## Cambios aplicados

| Archivo | Cambio | Línea final |
| ------- | ------ | ----------- |
| `components/site/toast.tsx` | `useRef<Set<number>>` de timers + `useEffect` de cleanup y borrado del timer al dispararse | 44-54, 65-69 |
| `components/landing/hero.tsx` | `motion-reduce:animate-none` en el dot con `animate-ping` | 16 |
| `components/landing/bp-calculator.tsx` | eliminado el `useId()`/`id` del panel de resultado sin referencias | 109, 178 |
| `components/landing/bp-calculator.tsx` | `aria-atomic="true"` en la región live del resultado | 180 |
| `components/site/site-header.tsx` | CTA y login de la barra usan `handleLogin`/`handleRegister` (cierran el menú móvil) | 63, 70 |
| `components/site/auth-modals.tsx` | `?.focus?.()` → `?.focus()` | 158 |

`git diff` sobre los archivos del alcance (los demás diffs en el worktree son cambios de otros archivos, ajenos a esta revisión).

## Verificación ejecutada

| Comprobación | Comando / evidencia | Resultado |
| ------------ | ------------------- | --------- |
| ESLint | `pnpm lint` | exit 0 |
| TypeScript estricto | `pnpm exec tsc --noEmit` | exit 0 |
| Build de producción | `pnpm build` | ✓ 10/10 páginas, `/` prerenderizada estática |
| `useId` muerto sin consumidores | `grep -rn "ids.result\|resultBox" .playwright-mcp` | sin coincidencias |
| Fronteras `'use client'` | `grep -l "'use client'" components/...` + `app/page.tsx` | `features.tsx` y `site-footer.tsx` sin directiva (Server Components) |

## No verificable / fuera de alcance

- **Comportamiento real con lectores de pantalla** del `aria-atomic` y del foco del modal (VoiceOver/NVDA): no hay entorno de AT disponible en esta sesión; el cambio se apoya en el patrón ARIA estándar, no en una prueba con AT real.
- **`components/landing/hero.tsx:30-47` y `cta.tsx:26-32`** (frontera cliente): la corrección propuesta no se aplicó y, por tanto, su ganancia de bundle **no está medida**.
- **Lógica de cálculo y validación de la calculadora** (`lib/bp/hooks/use-bp-calculator.ts`, `lib/bp/bp-categories.ts`): fuera de la lista de archivos. Observación: el hook usa `useMemo` para `categorize()`, justificado por el número de renders por pulsación, y `BpCalculator` no contiene validaciones (requisito de SPEC 02).
- **`useToast()`**: sí tiene consumidor (`lib/auth/hooks/use-register-form.ts:7,17,27`), por lo que el `useMemo` del `value` en `ToastProvider` está justificado; el archivo no se revisó por estar fuera de la lista.

## Anexo — qué se revisó y está correcto

- **Fronteras Server/Client:** `app/page.tsx` es Server Component y solo los hijos interactivos son cliente (`join point` correcto); `features.tsx` y `site-footer.tsx` no llevan `"use client"`. No se pasa ninguna prop no serializable del servidor al cliente en estos archivos.
- **Hooks:** sin hooks condicionales, en bucles ni tras `return` temprano. Deps correctas: `Modal` depende de `[open, onClose]` y `onClose` es un `useCallback([])` estable (`auth-modals.tsx:50`), así que el effect no se re-suscribe de más.
- **Efectos:** el único `useEffect` de `auth-modals.tsx` (focus trap con Tab, Escape, bloqueo de scroll del body y restauración del foco) es sincronización con el DOM — uso legítimo de un efecto — y su cleanup revierte listeners, `overflow` y foco (`auth-modals.tsx:151-159`). No hay efectos para derivar estado ni efectos en cascada.
- **Estado derivado en render:** `bucketStyle` y el objeto `ids` se derivan en render; no hay estado duplicado ni `useEffect` que sincronice props con estado.
- **Keys:** listas renderizadas con claves estables y no índices: `key={link.href}` (`site-header.tsx:54,107`) y `key={toast.id}` (`toast.tsx:71`). No hay `Math.random()` ni claves faltantes.
- **Memoización:** `useMemo`/`useCallback` están presentes solo donde hay un motivo (consumidores de contexto y deps de efecto) y no se añadió memoización nueva en ningún sitio. Los handlers inline de Hero/Header no se pasan a componentes memoizados, así que no necesitan `useCallback`.
- **React 19 / anti-patrones:** sin `forwardRef`, `defaultProps`, refs string, `React.FC`, `any`, `dangerouslySetInnerHTML`, mutación de props/estado ni `defaultProps`.
- **Imágenes:** no hay ninguna etiqueta `<img>` en los 8 archivos, así que `next/image` **no aplica** (las tarjetas y gráficos son SVG inline con `aria-hidden`).
- **Accesibilidad de interacción:** botones con `type="button"` y `aria-label` donde aplica (`site-header.tsx:82`), menú móvil con `aria-expanded`/`aria-controls` (`site-header.tsx:83-84`), modal con `role="dialog"`, `aria-modal`, `aria-labelledby` y `aria-describedby` (`auth-modals.tsx:173-176`), inputs con `label htmlFor`/`id` y `inputMode="numeric"`.
