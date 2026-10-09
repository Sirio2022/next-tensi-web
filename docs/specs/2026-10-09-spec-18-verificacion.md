# Verificación — SPEC 18 (Configuración: shell, gating por plan y "Mi Plan")

> **Spec:** `specs/dashboard/18-configuracion-shell-gating-y-mi-plan.md`
> **Fecha:** 2026-10-09
> **Estado del spec:** Implemented (sin cambios de estado; lo decide el humano)
> **Rama:** `spec-18-configuracion-shell-gating-y-mi-plan`
> **Resultado:** ✅ Los 18 criterios de aceptación se sostienen tras verificación independiente. Sin correcciones de código necesarias.

## Resumen

Se verificó el spec de forma independiente: lectura de toda la implementación
(`lib/settings/core/**`, `lib/settings/hooks/**`, `components/settings/**`, las 8
páginas de `app/(dashboard)/dashboard/settings/**`, el redirect de
`/dashboard/profile`, `lib/dashboard/nav.ts`), `pnpm lint` (exit 0), `pnpm exec
tsc --noEmit` (exit 0), `pnpm build` (exit 0, las 6+ rutas del shell en la tabla de
rutas) y Playwright contra la app real con sesión real (cookie `tensi_token`) y la
API Nest + Postgres.

- **UI (Playwright):** se reprodujo el flujo completo con **dos cuentas reales**:
  Premium (`admin@tensi.com`, plan `PREMIUM` con contraseña) y Free (cuenta de
  prueba temporal, plan `FREE` con contraseña). Se comprobó sub-nav activa
  (`aria-current`), las 6 secciones en orden, Vista General con los 4 bloques,
  "Acceso Rápido" con `?tab=password`, redirect de `/dashboard/profile`, "Mi Plan"
  en ambos planes, la comparativa (7 filas), el `<dialog>` nativo (apertura,
  Escape, backdrop, botón "Cerrar" y retorno de foco al disparador), el banner
  inferior Free/Premium, los 4 placeholders "Disponible próximamente" y responsive
  375/1440.
- **Convenciones:** `grep` confirma que `lib/settings/core/**` no importa `next/*`
  ni usa `window`/`document`/`localStorage`; `components/settings/**` no importa
  `next/link` (solo una mención en un comentario) ni usa etiquetas `<a>`; sin hooks
  vetados (SPEC 11); props `Readonly<>`; clases canónicas (`lint` limpio).

No se aplicó ninguna corrección: la implementación ya cumplía.

## Evidencia por criterio

| # | Criterio | Método | Resultado |
| - | -------- | ------ | --------- |
| 1 | Sidebar "Configuración" → `/dashboard/settings` con `aria-current="page"`, también en sub-rutas | Playwright en `/dashboard/settings`, `/…/plan`, `/…/profile`: el enlace del sidebar y el ítem activo del sub-nav llevan `aria-current="page"` | OK |
| 2 | `/dashboard/profile` redirige a `/dashboard/settings/profile` y el editor (SPEC 14) sigue funcionando | Navegación a `/dashboard/profile` → URL final `/dashboard/settings/profile`, `role="tablist"` presente, panel de perfil renderizado | OK |
| 3 | Shell con las 6 secciones del mockup, en orden, marcando la activa | DOM del `<nav aria-label="Secciones de configuración">`: Vista General, Notificaciones, Apariencia, Seguridad, Mi Plan, Avanzado; activa marcada por pathname | OK |
| 4 | "Vista General" con resumen de perfil, médica (medicamentos), acceso rápido y cuenta con datos de sesión | DOM: 4 bloques `Información Personal / Médica / Acceso Rápido / Cuenta`; nombre/email/plan reales; estados vacíos "Sin especificar" y "Sin medicamentos registrados." con datos reales de la sesión | OK |
| 5 | "Acceso Rápido" enlaza a editar perfil y a `?tab=password` (abre la pestaña) | DOM: `href="/dashboard/settings/profile"` y `href="/dashboard/settings/profile?tab=password"`; al visitar el segundo, "Cambiar Contraseña" tiene `aria-selected="true"` y el panel muestra el formulario de contraseña | OK |
| 6 | "Mi Plan": estado del plan, comparativa Free vs Premium y CTA | Premium → "Plan Premium" + badge "Plan Premium Activo", sin botón de upgrade; Free → "Plan Free" + botón "Actualizar a Premium"; tabla con caption y 7 filas | OK |
| 7 | El CTA abre un `<dialog>` nativo que cierra con Escape, backdrop y botón, devolviendo el foco al disparador | Playwright: `dialog.open`/`:modal` al abrir; tras Escape, clic en backdrop y botón "Cerrar" el diálogo se desmonta y `document.activeElement` vuelve a "Actualizar a Premium" en los tres casos | OK |
| 8 | Banner inferior "Plan Premium Activo" (Premium) / CTA de upgrade (Free) | DOM del sub-nav: Premium muestra el texto "Plan Premium Activo"; Free muestra un `AppLink` a `/dashboard/settings/plan` con "Actualizar a Premium" | OK |
| 9 | Notificaciones, Apariencia, Seguridad y Avanzado muestran "Disponible próximamente" igual para Free y Premium | Navegación a las 4 rutas: texto "Disponible próximamente" presente, sin candado ni CTA de pago | OK |
| 10 | Free y Premium ven las mismas 6 secciones; ninguna con candado premium | Sub-nav idéntico en ambas cuentas (mismos `href`/labels); 0 badges de candado | OK |
| 11 | `isLockedForPlan` y `PremiumLockedCard` existen documentados, sin aplicarse a secciones | Lectura de `lib/settings/core/gating.ts` y `components/settings/premium-locked-card.tsx`; sin importaciones en ninguna vista del shell | OK |
| 12 | `grep`: `lib/settings/core/**` sin `next/*` ni `window`/`document`/`localStorage` | `grep -rn "from \"next\|window\.\|document\.\|localStorage" lib/settings/core` → sin coincidencias | OK |
| 13 | `components/settings/**` no importa `next/link` directamente (usan `AppLink`) | `grep` → sin imports; solo una mención en un comentario de `premium-locked-card.tsx` | OK |
| 14 | Sin `<a>`, props `Readonly<>`, clases canónicas (`pnpm lint` limpio) | `grep` de `<a …>` en `components/settings/**` → sin coincidencias; props con `Readonly<>`; `pnpm lint` exit 0 | OK |
| 15 | Ningún componente en `app/**`/`components/**` usa hooks vetados por SPEC 11 | `grep` de `useState/useEffect/…` en `app`, `components` → sin coincidencias; la lógica está en `lib/settings/hooks/**` | OK |
| 16 | `/dashboard/settings` y sub-rutas usables a 375 px y 1440 px sin scroll horizontal ni errores de consola | `scrollWidth === clientWidth` en `/dashboard/settings` y `/…/plan` a 375 y 1440; 0 errores de consola | OK |
| 17 | `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build` | exit 0 / exit 0 / exit 0 (21 rutas generadas, incluidas todas las de `settings`) | OK |
| 18 | `git -C ../nest-tensi-api status --short` sin cambios (front-only) | Salida vacía | OK |

## Artefactos Playwright

Generados en `.playwright-mcp/` (carpeta generada, no se commitea):

- `verify-18-premium-general-1440.png` — Vista General (Premium) a 1440.
- `verify-18-premium-general-375.png` — Vista General (Premium) a 375.
- `verify-18-free-plan-1440.png` — Mi Plan (Free) con CTA.
- `verify-18-free-plan-dialog.png` — `<dialog>` "Próximamente" abierto.
- `verify-18-free-coming-soon.png` — placeholder "Disponible próximamente".
- `settings-general-premium.png`, `settings-plan-premium.png`,
  `settings-plan-dialog-free.png`, `settings-profile-password-tab.png`,
  `settings-coming-soon.png`, `settings-375.png` — capturas previas
  complementarias.

## Notas

- **Entorno.** El puerto 3000 estaba ocupado por el contenedor Docker
  `bloodpressure-api`, así que la verificación se hizo con `next dev -p 3001` (no
  se detuvo ningún servicio del usuario). La API Nest (`:3002`) y Postgres
  (`tensi_db`, `:5433`) ya tenían datos; se arrancó la API compilada
  (`node dist/src/main.js`) solo durante la verificación y se detuvo al terminar.
  La sesión se inyectó como cookie `tensi_token` en el contexto de Playwright
  (el `AuthProvider` recibe el usuario ya resuelto en SSR, sin `check-token`
  cliente).
- **Cuentas de prueba.** Premium fue `admin@tensi.com` (usuario semilla, plan
  `PREMIUM`). Para Free se creó una cuenta temporal vía la API de registro,
  se verificó con el código de la BD y se eliminó al terminar. No se dejaron
  usuarios ni procesos de prueba activos (puertos 3001 y 3002 liberados).
- **CORS/datos.** La verificación se hizo contra la API real, no con mocks. Los
  usuarios de prueba no tenían datos de perfil, por lo que se ejercieron los
  estados vacíos ("Sin especificar", "Sin medicamentos registrados.") con datos
  reales de sesión.
- **Sin hallazgos.** No se detectó ningún incumplimiento de criterios,
  convenciones ni accesibilidad que requiriera corrección de código.
