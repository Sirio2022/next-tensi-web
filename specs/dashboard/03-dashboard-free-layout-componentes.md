# SPEC 03 — Dashboard Free: layout, componentes y responsive

> **Status:** Aprobado
> **Depends on:** SPEC 01, SPEC 02
> **Date:** 2026-10-02
> **Objective:** Implementar el dashboard de un usuario Free según `references/dashboard/01-page`, con el shell (sidebar + header), sus componentes reutilizables y el comportamiento responsive, sin datos dinámicos ni integración con Nest.

## Por qué existe esta spec

- El `(dashboard)/dashboard/page.tsx` actual es un mínimo de la SPEC 01 para probar la sesión: muestra username/email/plan y un botón de logout.
- `references/dashboard/01-page` define el diseño real: sidebar de navegación, header con badge de plan, aviso médico, estado vacío Free, banner de upgrade y referencia de rangos OMS.
- El mockup embebe dos vistas (Free y Premium) más un switcher de prueba. Este spec cubre **solo la vista Free**.
- La UI debe verse terminada aun sin lecturas ni API, para que la integración posterior solo reemplace datos.

## Alcance

**In:**

- Shell autenticado `app/(dashboard)/layout.tsx`: sidebar (marca, navegación principal, bloque inferior de Configuración y Cerrar Sesión) + área de contenido con header.
- Header del dashboard: título "Panel Principal", badge de plan, botón "Mejorar Plan" y bloque de perfil (avatar con iniciales, nombre y email).
- Página `app/(dashboard)/dashboard/page.tsx` (Server Component) con: aviso médico, título + botón "Registrar Nueva Lectura", estado vacío Free, banner de upgrade y tabla de referencia de rangos OMS.
- Componentes reutilizables del dashboard (`components/dashboard/`): `DashboardShell`, `DashboardSidebar`, `SidebarNavItem`, `SidebarBrand`, `DashboardHeader`, `PlanBadge`, `UpgradeButton`, `UserProfile`, `MedicalDisclaimer`, `EmptyReadingsCard`, `UpgradeBanner`, `BpRangesReference`.
- Componentes UI base (`components/ui/`): `Card`, `Button`, `Badge`, `LockBadge`.
- Sección de referencia de rangos OMS generada desde los datos de `lib/bp/bp-categories.ts` (fuente única del mapeo) mapeados a los 6 rangos informativos del mockup.
- Candados de `Análisis` y `Reportes PDF` en el sidebar, con click que desplaza al banner de upgrade.
- Comportamiento responsive del mockup: sidebar apilado arriba en móvil, columna fija `md:w-64`; contenido a una columna en móvil y grid donde aplique; usable a 375px y 1440px sin scroll horizontal.
- `PlanBadge` y `UpgradeButton` reciben el plan como prop y se derivan de `user.plan`.

**Out of scope (para specs futuras):**

- Vista Premium: KPIs, gráfico de evolución, tabla de últimas lecturas y switcher "Vista Previa".
- Integración con la API Nest (`bp-readings`) y cualquier dato dinámico o estado real de datos.
- Pantallas hermanas: `Nueva Lectura`, `Historial`, `Análisis`, `Reportes PDF`, `Configuración` (los enlaces quedan como marcadores no navegables).
- Flujo de upgrade a Premium, checkout y lógica de entitlements.
- Drawer/hamburguesa de navegación en móvil.
- Toggle de tema claro/oscuro y SEO/i18n.

## Modelo de datos

No hay modelos de base de datos nuevos. Se reutiliza `AuthUser` y `Plan` de `lib/auth/types.ts`.

Tipos nuevos de presentación (`lib/dashboard/nav.ts`):

```ts
export type DashboardNavItemId =
  | "dashboard"
  | "new-reading"
  | "history"
  | "analytics"
  | "reports"
  | "settings"

export interface DashboardNavItem {
  id: DashboardNavItemId
  label: string
  href: string
  /** La feature existe en el producto pero no para el plan Free. */
  requiresPremium: boolean
}
```

Tipos de la referencia de rangos (`lib/dashboard/bp-ranges.ts`):

```ts
/** Tonos visuales disponibles para los rangos. */
export type BpRangeTone =
  | "sky"
  | "emerald"
  | "emerald-soft"
  | "amber"
  | "orange"
  | "rose"

export interface BpRangeDisplay {
  label: string
  range: string
  tone: BpRangeTone
  /** Categorías de `lib/bp/bp-categories.ts` que caen en este rango. */
  categories: readonly BpCategory[]
}
```

`BP_RANGE_DISPLAY` es un array ordenado de 6 entradas que reproduce las filas del mockup: Hipotensión (`< 90 / 60`, sky), Óptima (`< 120 / 80`, emerald), Normal (`120-129 / 80-84`, emerald-soft), Normal Alta (`130-139 / 85-89`, amber), Hipertensión 1 (`140-159 / 90-99`, orange) e Hipertensión 2 (`≥ 160 / 100`, rose). Las etiquetas y rangos son **texto informativo**; el array de `categories` es lo que ata la tabla a la fuente única de categorías.

## Plan de implementación

1. Crear `components/ui/card.tsx`, `button.tsx` y `badge.tsx` como componentes presentacionales con props `Readonly<>`, variantes por `tone`, sin lógica de negocio. Verificación: `pnpm lint` y `tsc --noEmit` pasan.
2. Crear `components/ui/lock-badge.tsx` (candado ámbar reutilizable usado por `Análisis` y `Reportes PDF`).
3. Crear `lib/dashboard/nav.ts` con `DashboardNavItem` y el array `DASHBOARD_NAV_ITEMS` (5 ítems principales + Configuración en el bloque inferior), con `requiresPremium` en `analytics` y `reports` y `href: '#'` en todo lo no implementado.
4. Crear `lib/dashboard/bp-ranges.ts` con `BpRangeTone`, `BpRangeDisplay` y `BP_RANGE_DISPLAY`, importando `BpCategory` desde `lib/bp/bp-categories.ts` (sin duplicar la tabla de rangos numéricos del backend).
5. Crear `components/dashboard/sidebar-brand.tsx`: marca Tensi con el logo del mockup y el gradiente `tensi`.
6. Crear `components/dashboard/sidebar-nav-item.tsx`: ítem de navegación con estado activo, ícono e indicador de candado opcional.
7. Crear `components/dashboard/dashboard-sidebar.tsx`: compone marca, `DASHBOARD_NAV_ITEMS` y el bloque inferior (Configuración + Cerrar Sesión). El logout reutiliza `useAuth().logout` de la SPEC 01 y redirige a `/login`.
8. Crear `components/dashboard/plan-badge.tsx` y `components/dashboard/upgrade-button.tsx`: reciben `plan` como prop; Free muestra "Plan Free" y el botón "Mejorar Plan" (gradiente ámbar) que hace scroll al `UpgradeBanner`.
9. Crear `components/dashboard/user-profile.tsx`: avatar con iniciales derivadas del `username`/`email` del `AuthUser` de la sesión, más nombre y email (ocultos en móvil como en el mockup).
10. Crear `components/dashboard/dashboard-header.tsx`: título, `PlanBadge`, `UpgradeButton`, separador y `UserProfile`, consumiendo el plan real.
11. Crear `components/dashboard/medical-disclaimer.tsx`: aviso médico del mockup con ícono ámbar y `role="note"`.
12. Crear `components/dashboard/empty-readings-card.tsx`: tarjeta de bienvenida con ícono, copy y CTA "Agregar mi primera medición" (sin acción todavía).
13. Crear `components/dashboard/upgrade-banner.tsx` con `id="upgrade"` (destino del scroll del `UpgradeButton`) y el copy del mockup.
14. Crear `components/dashboard/bp-ranges-reference.tsx`: renderiza `BP_RANGE_DISPLAY` en la grilla `grid-cols-2 sm:grid-cols-4 lg:grid-cols-6` del mockup.
15. Crear `components/dashboard/dashboard-shell.tsx`: layout de dos columnas (`flex-col md:flex-row`), sidebar y `main` con `DashboardHeader` y contenido scrollable.
16. Reescribir `app/(dashboard)/layout.tsx` para montar `DashboardShell` con el usuario de `verifySession()`; conservar `AuthProvider` de la SPEC 01.
17. Reescribir `app/(dashboard)/dashboard/page.tsx` componiendo `MedicalDisclaimer`, la fila de título + botón "Registrar Nueva Lectura", `EmptyReadingsCard`, `UpgradeBanner` y `BpRangesReference`, leyendo `user.plan` de `verifySession()`.
18. Ajustar responsive y accesibilidad: `aria-current="page"` en el ítem activo, `aria-label` en el candado, foco visible, y verificación 375px/1440px.

## Criterios de aceptación

- [ ] `GET /dashboard` con sesión válida renderiza el shell con sidebar y header según `references/dashboard/01-page/screenshot1.png`.
- [ ] El sidebar muestra Dashboard (activo), Nueva Lectura, Historial, Análisis y Reportes PDF, más Configuración y Cerrar Sesión en el bloque inferior.
- [ ] `Análisis` y `Reportes PDF` muestran el candado ámbar; el del dashboard no.
- [ ] El ítem activo (`Dashboard`) tiene `aria-current="page"` y el tratamiento visual de activo.
- [ ] El header muestra el título "Panel Principal", el badge "Plan Free", el botón "Mejorar Plan" y el perfil con nombre y email del usuario de la sesión.
- [ ] El badge de plan se deriva de `user.plan`; con `plan: 'FREE'` muestra "Plan Free" y el botón "Mejorar Plan" visible.
- [ ] "Mejorar Plan" desplaza la vista al banner de upgrade.
- [ ] El aviso médico se muestra arriba del contenido.
- [ ] El estado vacío ("¡Bienvenido a tu control de presión!") y el banner "Desbloquea Tensi Premium" se renderizan siempre en este spec.
- [ ] "Cerrar Sesión" llama a `POST /api/auth/logout` de la SPEC 01 y navega a `/login`.
- [ ] La referencia de rangos lista las 6 filas del mockup en el orden y con los colores indicados.
- [ ] `BP_RANGE_DISPLAY` importa `BpCategory` desde `lib/bp/bp-categories.ts`; no hay rangos numéricos duplicados del backend.
- [ ] No existen componentes ni secciones de la vista Premium (KPIs, gráfico, últimas lecturas, switcher "Vista Previa") en el código.
- [ ] Ninguna llamada a la API de Nest se dispara al cargar `/dashboard` (salvo el `check-token` de `verifySession()`).
- [ ] Usable a 375px y 1440px sin scroll horizontal; el sidebar se apila en móvil y pasa a `md:w-64` desde `md`.
- [ ] Los componentes no contienen lógica de cálculo ni validaciones; los datos viajan por props.
- [ ] Todos los componentes declaran sus props con `Readonly<>`.
- [ ] `pnpm lint` y `pnpm exec tsc --noEmit` pasan.
- [ ] No hay errores en consola al cargar `/dashboard`.

## Decisiones

- **Sí:** solo la vista Free; la Premium va en su propia spec. Evita código muerto y un switcher de prueba en producción.
- **No:** portar el switcher "Vista Previa" del mockup. Es un artefacto de demo.
- **Sí:** el shell (sidebar + header) vive en `app/(dashboard)/layout.tsx`, así las futuras pantallas hermanas lo heredan.
- **Sí:** reutilizar `logout` de `useAuth` (SPEC 01), que ya llama a `POST /api/auth/logout`.
- **Sí:** `PlanBadge` y `UpgradeButton` reciben `plan` por prop y se derivan de `user.plan`. La spec de Premium solo cambia el valor.
- **Sí:** la referencia de rangos importa `BpCategory` desde `lib/bp/bp-categories.ts`; la tabla numérica del backend sigue siendo fuente única.
- **No:** usar la categorización de la app (9 categorías / 5 buckets) en la barra de rangos. El mockup muestra 6 filas informativas y esa es su función.
- **Sí:** candado clicable que desplaza al banner de upgrade. Da salida comercial sin implementar checkout.
- **Sí:** enlaces del sidebar no implementados quedan como `href="#"` y no navegan.
- **Sí:** el estado vacío y el banner se renderizan siempre por ahora; la condicionalidad por datos entra en la spec de integración.
- **Sí:** usuario, nombre y email salen de `AuthUser` (sesión), con iniciales derivadas; no se hardcodea "JM"/"Juan Manuel" del mockup.
- **No:** drawer/hamburguesa en móvil. Se reproduce el sidebar apilado del mockup.
- **No:** toggle de tema. La paleta oscura es el tema por defecto.

## Riesgos

| Riesgo                                                              | Mitigación                                                                                    |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| El mockup usa la paleta `brand`/`slate` y no los tokens `tensi`     | Mapear azul/índigo del mockup a los tokens `tensi` existentes en `app/globals.css`            |
| La tabla OMS de 6 filas puede leerse como la categorización real    | Copy de referencia educativa y comentario en `lib/dashboard/bp-ranges.ts`                     |
| Componentes demasiado acoplados al mockup dificultan la integración | Datos por props y sin lógica; la integración solo reemplaza valores                           |
| El sidebar apilado en móvil alarga la página                        | Verificar a 375px y ajustar densidad si el nav empuja el contenido demasiado                  |
| Duplicar la tabla de rangos del backend                             | `BP_RANGE_DISPLAY` solo agrupa categorías existentes; los números viven en `bp-categories.ts` |

## Qué **no** entra en esta spec

- Vista Premium (KPIs, gráfico, últimas lecturas, switcher "Vista Previa").
- Integración con Nest y datos dinámicos de lecturas.
- Pantallas de Nueva Lectura, Historial, Análisis, Reportes PDF y Configuración.
- Flujo de upgrade, checkout y entitlements.
- Drawer móvil y toggle de tema.

Cada uno, si se implementa, va en su propia spec.
