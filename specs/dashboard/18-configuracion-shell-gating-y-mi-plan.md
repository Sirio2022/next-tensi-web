# SPEC 18 — Configuración: shell, gating por plan y "Mi Plan"

> **Status:** Implemented
> **Depends on:** SPEC 03, SPEC 06, SPEC 07, SPEC 11, SPEC 12, SPEC 14, SPEC 17
> **Date:** 2026-10-09
> **Objective:** Sustituir `/dashboard/profile` por un shell de Configuración con sub-navegación por secciones, un mecanismo reutilizable de gating Free/Premium y las secciones "Vista General" y "Mi Plan", dejando las demás como "próximamente".

## Por qué existe esta spec

- `references/dashboard/04-profile-premium/` define una pantalla "Configuración" con sub-sidebar de 6 secciones (Vista General, Notificaciones, Apariencia, Seguridad, Mi Plan, Avanzado) y estado Premium ("Plan Premium Activo"). **No hay mockup del estado Free**.
- Hoy el ítem "Configuración" del sidebar apunta a `/dashboard/profile` (`lib/dashboard/nav.ts:75-80`), que es el editor de perfil de SPEC 14 (2 pestañas). No existe el shell ni ninguna sección.
- La monetización actual es un candado que hace scroll al banner `#upgrade` (`premium-analytics-teaser.tsx`, `upgrade-banner.tsx`) y un `UpgradeButton` que solo hace scroll; no hay una pantalla donde ver el plan y compararlo.
- El back no ofrece preferencias, notificaciones, 2FA, sesiones, exportar/eliminar cuenta ni facturación: `User` solo tiene `plan` y `check-token` no expone `createdAt`. Esta spec es **front-only**.
- Se decidió trocear: esta es la espina dorsal (shell + gating + Mi Plan); Apariencia, Notificaciones y Seguridad van en sus propias specs.
- Debe respetar la frontera portable de SPEC 17 para que la futura app Expo pueda reutilizar la lógica (`lib/settings/core/**`) y las vistas (DOM components).

## Alcance

**In:**

- **Shell de Configuración** en `app/(dashboard)/dashboard/settings/`:
  - `layout.tsx` + `components/settings/settings-shell.tsx` (sub-sidebar de secciones + contenedor de contenido).
  - Sub-navegación con 6 secciones: Vista General (`/dashboard/settings`), Notificaciones (`/notifications`), Apariencia (`/appearance`), Seguridad (`/security`), Mi Plan (`/plan`), Avanzado (`/advanced`).
  - Banner inferior: "Plan Premium Activo" (Premium) o CTA de upgrade (Free).
- **Sección Vista General** (`/dashboard/settings`): resumen de perfil (avatar, nombre, email, nacimiento, peso, estatura, género), información médica (medicamentos), "Acceso Rápido" (Editar Perfil Completo y Cambiar Contraseña) e "Información de Cuenta" (usuario ID, tipo de plan, autenticación).
- **Sección Mi Plan** (`/dashboard/settings/plan`): estado del plan, comparativa Free vs Premium y CTA "Actualizar a Premium" que abre un modal `<dialog>` nativo "próximamente".
- **Mecanismo de gating reutilizable**: `lib/settings/core/gating.ts` + `components/settings/premium-locked-card.tsx`, listos para que las specs de sección bloqueen controles. En esta spec **no se marca ninguna sección como premium**.
- **Reubicación del editor de perfil**: mover `app/(dashboard)/dashboard/profile/page.tsx` → `app/(dashboard)/dashboard/settings/profile/page.tsx`; `/dashboard/profile` pasa a redirigir. El editor lee un `?tab=password` opcional para abrir directamente la pestaña de contraseña.
- **Navegación**: `DASHBOARD_SETTINGS_ITEM.href = "/dashboard/settings"`; `getActiveNavId` reconoce `/dashboard/settings/*` (incluida `/dashboard/settings/profile`).
- **Placeholders "Disponible próximamente"** para Notificaciones, Apariencia, Seguridad y Avanzado, iguales para Free y Premium.
- **Portabilidad (SPEC 17)**: la lógica en `lib/settings/core/**` (sin Next/DOM) y las vistas en `components/settings/**` como componentes cliente que reciben props y usan `components/ui/app-link.tsx` en vez de `next/link` directo. Las páginas son Server Components delgados (frontera de datos).
- Convenciones: props `Readonly<>`, clases canónicas, estado en `lib/settings/hooks/**` (SPEC 11), accesibilidad (SPEC 06), responsive 375/1440.

**Out of scope (para specs futuras):**

- Contenido real de **Notificaciones** (recordatorios, alertas, reportes automáticos email/push) → su spec, con back nuevo.
- Contenido real de **Apariencia** (tema claro/oscuro/automático, idioma/región, esquemas de color, ajustes avanzados) → su spec.
- Contenido real de **Seguridad** (2FA, gestión de sesiones, exportar/eliminar cuenta); el cambio de contraseña sigue en el editor de SPEC 14 → su spec.
- Contenido de **Avanzado** (no hay mockup).
- Pasarela de pago/Stripe y facturación real.
- Decidir qué es premium dentro de cada sección (lo hará cada spec usando el mecanismo de esta).
- Cambios en `nest-tensi-api`; tests automatizados; CSRF.

## Modelo de datos

No hay modelos de base de datos nuevos ni cambios de contrato con la API. Todo se deriva de `AuthUser` (SPEC 14), que ya trae `plan`, los campos de perfil y `providers`/`hasPassword`.

`lib/settings/core/sections.ts`:

```ts
export type SettingsSectionId =
  | "general"
  | "notifications"
  | "appearance"
  | "security"
  | "plan"
  | "advanced"

/** `coming-soon` = sección aún no implementada (placeholder accesible). */
export type SettingsSectionState = "available" | "coming-soon"

export interface SettingsSection {
  id: SettingsSectionId
  label: string
  description: string
  href: string
  icon: SettingsIconId // id → icono lucide resuelto en el componente
  state: SettingsSectionState
  highlighted?: boolean // solo "Mi Plan" (corona dorada)
}

export const SETTINGS_SECTIONS: readonly SettingsSection[]
export function getActiveSettingsSectionId(
  pathname: string
): SettingsSectionId | undefined
```

`lib/settings/core/gating.ts` (mecanismo reutilizable):

```ts
export function isLockedForPlan(requiresPremium: boolean, plan: Plan): boolean
```

`lib/settings/core/plan-comparison.ts`:

```ts
export interface PlanFeature {
  label: string
  free: boolean | string
  premium: boolean | string
}

export const PLAN_FEATURES: readonly PlanFeature[]
```

`lib/settings/core/general.ts`: helpers puros `describeAuthMethod(user)` ("Email y contraseña" si `hasPassword`; "Google/GitHub" según `providers`) y la composición del resumen.

Hooks web (`lib/settings/hooks/`): `use-active-settings-section.ts` (usa `next/navigation`) y `use-plan-upgrade-dialog.ts` (estado del `<dialog>` con `useNativeDialog`).

## Plan de implementación

1. **Config de secciones**: `lib/settings/core/sections.ts` (6 secciones con las descripciones del mockup; `available` para general/plan, `coming-soon` para el resto; `highlighted` en plan) y `getActiveSettingsSectionId`. Verificación: `pnpm exec tsc --noEmit` y casos manuales del helper.
2. **Gating**: `lib/settings/core/gating.ts` + `components/settings/premium-locked-card.tsx` (control bloqueado con `LockBadge` y CTA). Verificación: `tsc`; no se aplica a ninguna sección todavía.
3. **Comparativa**: `lib/settings/core/plan-comparison.ts` con las filas Free vs Premium. Verificación: `tsc`.
4. **Helpers de Vista General**: `lib/settings/core/general.ts` (`describeAuthMethod` y composición del resumen). Verificación: `tsc`.
5. **Hooks**: `lib/settings/hooks/use-active-settings-section.ts` y `use-plan-upgrade-dialog.ts`. Verificación: `pnpm lint` (SPEC 11: cero hooks vetados en componentes).
6. **Shell**: `app/(dashboard)/dashboard/settings/layout.tsx` + `components/settings/settings-shell.tsx` y `settings-section-nav.tsx` (client; `AppLink`, `aria-current`, `coming-soon` con nota, "Mi Plan" con corona). Verificación: navegar entre secciones; la activa se marca.
7. **Vista General**: `app/(dashboard)/dashboard/settings/page.tsx` (`PageProps<"/dashboard/settings">`, Server Component) + `components/settings/general-overview.tsx` (perfil, médica, acceso rápido, cuenta). Verificación: los cuatro bloques con datos reales de `verifySession()`.
8. **Mi Plan**: `.../settings/plan/page.tsx` + `components/settings/plan-overview.tsx` + `components/settings/plan-upgrade-dialog.tsx`. Verificación: Free ve "Plan Free" con CTA; Premium ve estado Premium; el modal abre/cierra con Escape.
9. **Placeholders**: `.../settings/{notifications,appearance,security,advanced}/page.tsx` con `components/settings/coming-soon-section.tsx`. Verificación: las cuatro rutas renderizan.
10. **Reubicar el editor**: mover la página a `.../settings/profile/page.tsx` (metadata acorde), leer `?tab=password` en las tabs, y dejar `app/(dashboard)/dashboard/profile/page.tsx` como `redirect("/dashboard/settings/profile")`. Verificación: `/dashboard/profile` redirige; el editor de SPEC 14 sigue funcionando.
11. **Navegación**: `lib/dashboard/nav.ts` (`DASHBOARD_SETTINGS_ITEM.href = "/dashboard/settings"`; `getActiveNavId` con el prefijo nuevo). Verificación: "Configuración" navega al shell y queda `aria-current="page"` en todas las secciones.
12. **Cierre**: a11y (nav con `aria-label`, `aria-current`, foco, `<dialog>` nativo, `role="alert"` si aplica), copy en español, responsive 375/1440; `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build`; Playwright del flujo Free y Premium.

## Criterios de aceptación

- [ ] El ítem "Configuración" del sidebar navega a `/dashboard/settings` y queda `aria-current="page"`, también en sus sub-rutas.
- [ ] `/dashboard/profile` redirige a `/dashboard/settings/profile` y el editor de perfil (SPEC 14) sigue funcionando.
- [ ] El shell muestra el sub-sidebar con las 6 secciones del mockup, en orden, marcando la activa.
- [ ] "Vista General" muestra resumen de perfil, información médica (medicamentos), acceso rápido e información de cuenta con datos reales de la sesión.
- [ ] "Acceso Rápido" enlaza a "Editar Perfil Completo" (`/dashboard/settings/profile`) y a "Cambiar Contraseña" (`...?tab=password`, abre la pestaña de contraseña).
- [ ] "Mi Plan" muestra el estado del plan, una comparativa Free vs Premium y el CTA "Actualizar a Premium".
- [ ] El CTA abre un `<dialog>` nativo "próximamente" que cierra con Escape, backdrop y botón, y devuelve el foco al disparador.
- [ ] El banner inferior muestra "Plan Premium Activo" para Premium y un CTA de upgrade para Free.
- [ ] Notificaciones, Apariencia, Seguridad y Avanzado muestran "Disponible próximamente" igual para Free y Premium.
- [ ] Free y Premium ven las mismas 6 secciones; ninguna queda con candado premium en esta spec.
- [ ] `isLockedForPlan` y `PremiumLockedCard` existen como mecanismo documentado para las specs de sección (sin aplicarse a secciones todavía).
- [ ] `grep` confirma que `lib/settings/core/**` no importa `next/*` ni usa `window`/`document`/`localStorage`.
- [ ] Las vistas de `components/settings/**` no importan `next/link` directamente (usan `AppLink`).
- [ ] No hay etiquetas `<a>` (todo `next/link`/`AppLink`), props con `Readonly<>` y clases canónicas (`pnpm lint` limpio).
- [ ] Ningún componente en `app/**`/`components/**` usa hooks vetados por SPEC 11.
- [ ] `/dashboard/settings` y sus sub-rutas son usables a 375 px y 1440 px sin scroll horizontal ni errores de consola.
- [ ] `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build` pasan.
- [ ] `git -C ../nest-tensi-api status --short` sin cambios (spec front-only).

## Decisiones

- **Sí:** trocear en 4 specs (18 shell+gating+Mi Plan; luego Apariencia, Notificaciones, Seguridad). No cabe en una sola y toca 4+ dominios.
- **Sí:** esta spec es front-only y reutiliza `AuthUser` de SPEC 14; el back no ofrece preferencias, 2FA, sesiones, export/delete ni facturación.
- **Sí:** Free y Premium ven las mismas secciones; el mapa fino de qué es premium se decide en cada sección. Evita inventar sin mockup del estado Free.
- **Sí:** el mecanismo de gating queda listo (`isLockedForPlan` + `PremiumLockedCard`) pero sin bloquear ninguna sección todavía.
- **Sí:** "Mi Plan" sin pasarela; el CTA abre un modal nativo "próximamente".
- **Sí:** rutas por sección con Server Components (URLs compartibles) en vez de una página con tabs cliente.
- **Sí:** Configuración reemplaza `/dashboard/profile` como destino del sidebar; el editor se muda a `/dashboard/settings/profile` y `/dashboard/profile` redirige.
- **Sí:** las 4 secciones futuras se incluyen como "Disponible próximamente" para no romper la fidelidad al mockup de 6 ítems.
- **Sí:** "Acceso Rápido → Cambiar Contraseña" usa `?tab=password`; pequeña extensión del editor de SPEC 14 en vez de duplicar el formulario.
- **Sí:** la lógica portable vive en `lib/settings/core/**` y las vistas usan `AppLink`, según SPEC 17, para que Expo pueda consumirlas.
- **No:** pasarela de pago/Stripe (spec de facturación aparte).
- **No:** cambios en `nest-tensi-api`.
- **No:** tests automatizados.

## Riesgos

| Riesgo                                                              | Mitigación                                                                                  |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Mover la ruta del editor rompe enlaces o la marca activa            | Redirect de `/dashboard/profile` y `getActiveNavId` con el prefijo `/dashboard/settings`.   |
| Los mockups solo cubren Premium y no hay diseño Free                | Reutilizar `PlanBadge` y el patrón de upgrade actual; se define aquí la vista Free.         |
| "Próximamente" puede leerse como "premium"                          | Copy explícito "Disponible próximamente" (sin candado) y sin CTA de pago en esas secciones. |
| Estado de la sub-nav en un componente (SPEC 11)                     | Pathname en `lib/settings/hooks/use-active-settings-section.ts`.                            |
| El sub-sidebar compite con el sidebar principal                     | El sub-sidebar vive dentro del `<main>`, no reemplaza al `DashboardSidebar`.                |
| Exponer las vistas a DOM components puede reintroducir acoplamiento | Frontera de datos + `AppLink` de SPEC 17; `lib/settings/core/**` bajo el guard de lint.     |

## Qué **no** entra en esta spec

- Contenido de Notificaciones, Apariencia, Seguridad y Avanzado.
- 2FA, gestión de sesiones, exportar/eliminar cuenta.
- Tema claro/oscuro, idioma, esquemas de color.
- Facturación/pasarela.
- Cambios en el back y tests automatizados.

Cada uno, si se implementa, va en su propia spec.
