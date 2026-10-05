# SPEC 12 — Análisis Premium, dashboard Premium e Historial paginado

> **Status:** Verificado
> **Depends on:** SPEC 03, SPEC 06, SPEC 07, SPEC 10, SPEC 11
> **Date:** 2026-10-05
> **Objective:** Implementar la pantalla Análisis Premium (resumen, tendencia, promedios por periodo, distribución, stats, emergencias y resumen semanal), rellenar el dashboard Premium (con pico/mínima de 7 días y variación semanal) y paginar el Historial ilimitado, añadiendo al back solo el endpoint de resumen semanal.

## Por qué existe esta spec

- SPEC 10 dejó el dashboard y el historial en clave Free. El dashboard Premium hoy solo renderiza `BpRangesReference` (`app/(dashboard)/dashboard/page.tsx:43-44`), y los ítems **Análisis** y **Reportes PDF** del sidebar quedaron como botones bloqueados (`lib/dashboard/nav.ts:57-68`).
- Premium ya tiene casi todo en el back: `GET /bp-readings` con `skip`/`limit` (20 por defecto, ilimitado para Premium) y un controlador entero `bp-readings/analytics` protegido por `PremiumPlanGuard`. Solo falta el resumen semanal (pico/mínima y variación), que esta spec añade.
- No hay datos de prueba: `admin@tensi.com` se crea como ADMIN sin `plan: PREMIUM` (`prisma/seed.ts:29-41`) y sin historial, así que no se pueden ver agregados semanales/mensuales/anuales ni probar la paginación.
- Reportes PDF queda fuera: va en su propia spec.

## Alcance

**In:**

- **Pantalla Análisis** `app/(dashboard)/dashboard/analytics/page.tsx` (Server Component, `metadata.title = "Análisis"`), solo Premium, con secciones alimentadas por `GET /bp-readings/analytics*`:
  - Resumen: `totalReadings`, `averages.systolic/diastolic/pulse`.
  - Tendencia sistólica/diastólica con selector **7 / 30 días** (`GET /analytics/trend`).
  - Promedios por periodo con toggle **Semanal / Mensual / Anual** (`GET /analytics/weekly|monthly|yearly`).
  - Distribución de lecturas por categoría OMS (`categoryDistribution` del `GET /analytics`).
  - Evolución mensual por categoría (`GET /analytics/category-distribution`).
  - Tabla por categoría: conteo, promedio sistólica/diastólica y última lectura (`GET /analytics/stats`).
  - Detalle de emergencias: `emergencyAlertsCount` + lista de lecturas críticas con fecha y notas (`emergencyAlerts` del `GET /analytics`).
  - Resumen semanal de 7 días: pico más alto, mínima y promedio de la semana con la variación porcentual respecto a los 7 días previos (`GET /analytics/weekly-summary`, endpoint nuevo en el back).
- **Guard de plan**: sesión válida; si `plan !== "PREMIUM"`, `redirect("/dashboard#upgrade")` sin llamar a ningún endpoint `/analytics`.
- **Sidebar según plan**: Premium navega a Análisis sin candado; Free conserva los candados de Análisis y Reportes hacia el banner. Reportes PDF queda como placeholder sin candado para Premium (sin navegar) hasta su spec.
- **Dashboard Premium** (`app/(dashboard)/dashboard/page.tsx`): fila de KPIs (última medición + pico, mínima y promedio de 7 días con su variación), resumen (`GET /analytics`), gráfica de tendencia 30 días (`GET /analytics/trend`), últimas lecturas (`GET /bp-readings?limit=5`), enlace a Análisis y `BpRangesReference`. El dashboard Free no cambia.
- **Paginación del Historial** (`app/(dashboard)/dashboard/history/page.tsx`): Premium pagina 20 por página vía `?page=N` con Anterior/Siguiente (`GET /bp-readings?skip=&limit=20`); Free sigue capado a 20 con la tarjeta de límite.
- **Seed de datos de prueba** (data-only, en `nest-tensi-api`): `prisma/seed-premium-demo.ts` idempotente que fija `admin@tensi.com` en PREMIUM y crea ~180 lecturas en ~15 meses.
- Cliente de datos en `lib/readings/` (tipos, API, DAL server-only), helpers puros en `lib/`, componentes presentacionales, Recharts reutilizado.
- Responsive 375/1440 y accesibilidad SPEC 06 (alternativa textual de las gráficas con `figure`/`figcaption`/`role="img"` + tabla `sr-only`).

**Out of scope (para specs futuras):**

- **Reportes PDF/CSV** y su pantalla (`/dashboard/reports`), y el endpoint `GET /analytics/export`.
- **Otros cambios de código en `nest-tensi-api`** (`src/**`) más allá del nuevo endpoint de resumen semanal; en `prisma/` solo el script de seed.
- **Dashboard Free**: no se modifica su comportamiento ni su copy.
- Editar o borrar lecturas; filtros del Historial por tags o rango de fechas; `GET /bp-readings/by-tags`.
- Cuota IA, `POST /bp-readings/evaluate` y selección de arm/postura.
- Pantalla `Configuración` y el resto de placeholders.
- Tests automatizados (el repo no tiene runner) y CSRF.

## Modelo de datos

No hay modelos de base de datos nuevos. El front tipa el contrato que ya devuelve la API.

`lib/readings/analytics-types.ts` (espejo de `bp-analytics-export.service.ts`, `bp-readings-analytics.service.ts` y `weekly-summary.dto.ts`):

```ts
import type { BloodPressureCategory } from "./types"

export interface EmergencyReadingAlert {
  id: string
  systolic: number
  diastolic: number
  timestamp: string
  notes: string | null
}

/** `GET /bp-readings/analytics` */
export interface AnalyticsSummary {
  totalReadings: number
  averages: { systolic: number; diastolic: number; pulse: number | null }
  categoryDistribution: Partial<Record<BloodPressureCategory, number>>
  emergencyAlertsCount: number
  emergencyAlerts: EmergencyReadingAlert[]
}

/** `GET /bp-readings/analytics/trend` */
export interface TrendReading {
  systolic: number
  diastolic: number
  timestamp: string
}

/** `GET /bp-readings/analytics/weekly|monthly|yearly` */
export interface WeeklyAverage {
  year: number
  week: number
  avgSystolic: number
  avgDiastolic: number
}
export interface MonthlyAverage {
  year: number
  month: number
  avgSystolic: number
  avgDiastolic: number
}
export interface YearlyAverage {
  year: number
  avgSystolic: number
  avgDiastolic: number
}

/** `GET /bp-readings/analytics/stats` */
export interface CategoryStat {
  category: BloodPressureCategory
  count: number
  avgSystolic: number
  avgDiastolic: number
  lastReading: string
}

/** `GET /bp-readings/analytics/category-distribution` */
export interface CategoryDistributionPoint {
  year: number
  month: number
  category: BloodPressureCategory
  count: number
}

/** `GET /bp-readings/analytics/weekly-summary` (endpoint nuevo) */
export interface WeeklySummaryPoint {
  systolic: number
  diastolic: number
  timestamp: string
}

export interface WeeklySummary {
  peak: WeeklySummaryPoint | null
  lowest: WeeklySummaryPoint | null
  average: { systolic: number; diastolic: number } | null
  /** % redondeado de la sistólica vs los 7 días previos; null sin base. */
  changePercent: number | null
}

export type AnalyticsRange = "7d" | "30d"
export type AnalyticsPeriod = "weekly" | "monthly" | "yearly"
```

Consulta paginada: `lib/readings/readings.api.ts` extiende `getReadings` a `getReadings(query?: { skip?: number; limit?: number })`, construyendo `/bp-readings?skip=&limit=`. `lib/readings/dal.ts` expone `getReadingsForSession(skip = 0, limit = 20)` (argumentos primitivos para que `cache()` memoicen bien).

`lib/readings/analytics.api.ts` (sobre `HttpClient`, con `client(httpClient)` como el resto):

| Función                              | Endpoint                                               |
| ------------------------------------ | ------------------------------------------------------ |
| `getAnalytics(client?)`              | `GET /bp-readings/analytics`                           |
| `getAnalyticsTrend(range, client?)`  | `GET /bp-readings/analytics/trend?startDate=&endDate=` |
| `getPeriodAverages(period, client?)` | `GET /bp-readings/analytics/{weekly\|monthly\|yearly}` |
| `getCategoryStats(client?)`          | `GET /bp-readings/analytics/stats`                     |
| `getCategoryDistribution(client?)`   | `GET /bp-readings/analytics/category-distribution`     |
| `getWeeklySummary(client?)`          | `GET /bp-readings/analytics/weekly-summary` (nuevo)    |

`lib/readings/analytics.dal.ts`: server-only, reenvía `Cookie` y envuelve con `cache()` y `Promise.all`; devuelve `null` en 401/403 (mismo patrón que `lib/readings/dal.ts`). Funciones: `getAnalyticsForSession()`, `getTrendForSession(range)`, `getPeriodAveragesForSession(period)`, `getCategoryStatsForSession()`, `getCategoryDistributionForSession()`, `getWeeklySummaryForSession()`.

En el back, el resumen semanal vive en `BpReadingsAnalyticsService.getWeeklySummary(userId)` con una ventana móvil de los **últimos 7 días** frente a **los 7 anteriores** (coherente con el `sevenDaysAgo` de `bp-ai-insight.service.ts`): `peak` es la lectura de mayor sistólica de la ventana (desempate por diastólica y luego la más reciente), `lowest` la de menor sistólica, `average` el promedio sistólica/diastólica de la ventana y `changePercent` la variación porcentual redondeada de la sistólica frente a la ventana previa (`null` si no hay base). Se tipa con `WeeklySummaryDto` en `src/bp-readings/dto/weekly-summary.dto.ts` y se expone como `@Get('weekly-summary')` en `BpReadingsAnalyticsController` (el `PremiumPlanGuard` de clase ya lo deja solo Premium).

Helpers puros:

- `lib/readings/analytics.ts`: `getRangeDates(range, now)`, `getPeriodLabel(period)`, `buildCategorySeries(distribution)` (categoría → `{ label, tone, count }`), `buildAveragePoints(period, data)` (uniforma weekly/monthly/yearly a `{ label, avgSystolic, avgDiastolic }`), `buildEvolutionSeries(points)` (mes → conteos por categoría), `formatWeeklyChange(changePercent)` (flecha + `±N %`).
- `lib/readings/pagination.ts`: `READINGS_PAGE_SIZE = 20`, `parseReadingsPage(value)` (entero ≥ 1, default 1), `buildReadingsPageHref(page)` → `Route`.
- `lib/dashboard/nav.ts` (extender): `getNavItemState(item, plan)` → `"link" | "placeholder" | "locked"` (ver plan, paso 6).

## Plan de implementación

Todo el trabajo es en `next-tensi-web` salvo los pasos 8 y 9, que son en `nest-tensi-api` (endpoint de resumen semanal y seed). Cada paso deja el sistema funcional.

1. **Tipos y capa de datos.** Crear `lib/readings/analytics-types.ts`; crear `lib/readings/analytics.api.ts` y `lib/readings/analytics.dal.ts`; extender `lib/readings/readings.api.ts` y `lib/readings/dal.ts` con `skip`/`limit`. Verificación: `pnpm exec tsc --noEmit`.
2. **Helpers puros.** Crear `lib/readings/analytics.ts` y `lib/readings/pagination.ts`. Verificación: `tsc` y casos manuales desde la consola del navegador.
3. **Gráfica de tendencia generalizada.** Extender `lib/dashboard/trend-points.ts` para aceptar `readonly { systolic, diastolic, timestamp, category? }[]` (id/categoría opcionales) y adaptar `components/dashboard/readings-trend-chart.tsx` para omitir categoría cuando no llega. El dashboard Free sigue pasando `BPReading[]` sin cambios de comportamiento. Verificación: dashboard Free y `/analytics/trend` pintan.
4. **Componentes presentacionales de Análisis** (props `Readonly<>`, sin estado; los toggles son grupos de `next/link` con `aria-current`): `analytics-summary-cards.tsx`, `analytics-weekly-kpis.tsx`, `analytics-range-toggle.tsx`, `analytics-period-toggle.tsx`, `analytics-period-averages.tsx`, `analytics-category-distribution.tsx`, `analytics-category-evolution.tsx`, `analytics-category-stats-table.tsx`, `analytics-emergency-alerts.tsx`. Todas las gráficas con `figure`/`figcaption`/`role="img"`/`aria-label` + tabla `sr-only`.
5. **Pantalla Análisis.** Crear `app/(dashboard)/dashboard/analytics/page.tsx` (`PageProps<"/dashboard/analytics">`, `searchParams` async para `?range=7d|30d` y `?period=weekly|monthly|yearly`); guard de plan; `Promise.all` de los DAL (incluido el resumen semanal); render de las secciones + `MedicalDisclaimer`. Verificación: Premium ve todas las secciones; Free redirige a `/dashboard#upgrade` sin requests a `/analytics`.
6. **Sidebar según plan.** En `lib/dashboard/nav.ts` cambiar `analytics.href` a `/dashboard/analytics` y añadir `getNavItemState(item, plan)`; reemplazar la unión discriminada de `components/dashboard/sidebar-nav-item.tsx` por un prop `state` explícito (manteniendo la exigencia de `onLockedSelect` cuando `state === "locked"`); `DashboardSidebar` recibe `plan` desde `DashboardShell` y resuelve cada ítem. Verificación: Premium sin candados y Análisis activo; Free con candados que hacen scroll al banner.
7. **Dashboard Premium.** Reescribir la rama Premium de `app/(dashboard)/dashboard/page.tsx` con `LastReadingCard` + `AnalyticsWeeklyKpis` (fila de KPIs), `AnalyticsSummaryCards` (`getAnalyticsForSession()`), `ReadingsTrendChart` 30 días (`getTrendForSession("30d")`), `LastReadingsTable` (`getReadingsForSession(0, 5)`, enlace "Ver historial") y una tarjeta CTA a `/dashboard/analytics`. Crear `components/dashboard/last-readings-table.tsx` y `components/dashboard/analytics-cta-card.tsx`. La rama Free no cambia. Verificación: Premium ya no ve solo la referencia OMS y muestra pico/mínima/promedio semanal.
8. **Endpoint de resumen semanal** (`nest-tensi-api`): crear `src/bp-readings/dto/weekly-summary.dto.ts`; implementar `getWeeklySummary(userId)` en `BpReadingsAnalyticsService` (ventana de 7 días vs los 7 previos: `peak`, `lowest`, `average`, `changePercent`); exponerlo como `@Get('weekly-summary')` en `BpReadingsAnalyticsController`. Verificación: con sesión Premium devuelve datos coherentes y con Free responde 403; `pnpm build`/`pnpm lint` del back.
9. **Seed Premium** (`nest-tensi-api`): crear `prisma/seed-premium-demo.ts` y el script `"seed:premium": "ts-node prisma/seed-premium-demo.ts"`. Upsert de `ADMIN_EMAIL` con `role: ADMIN`, `confirmed: true`, `plan: PREMIUM` y password de `ADMIN_INITIAL_PASSWORD`; borra las `BPReading` de ese usuario y crea 180 lecturas deterministas repartidas en ~15 meses (categorías variadas con ~3-5 en `grade_3_hypertension`, pulso presente en ~85 %, tags y notas en una parte, y con lecturas en los últimos 7 días y en los 7 previos para que `changePercent` no sea `null`), categorizando con `BloodPressureCategorizer`. Verificación: correrlo dos veces deja 180 lecturas y el plan en PREMIUM; `git status` solo muestra el endpoint y el seed.
10. **Paginación del Historial.** Reescribir `app/(dashboard)/dashboard/history/page.tsx` para leer `?page`, llamar `getReadingsForSession(skip, READINGS_PAGE_SIZE)` y renderizar `components/dashboard/history-pagination.tsx` cuando `meta.isFreePlan === false`. Free sin controles y con `ReadingsLimitCard`. Verificación: con 180 lecturas, 9 páginas navegables.
11. **Cierre.** Repasar a11y (alternativas textuales, foco, labels, `aria-current` en toggles y nav), responsive 375/1440, convenciones (sin `<a>`, props `Readonly<>`, clases canónicas, lógica fuera de componentes); `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build`; Playwright del flujo completo.

## Criterios de aceptación

- [x] `admin@tensi.com` (PREMIUM) ve el ítem **Análisis** sin candado, navega a `/dashboard/analytics` y queda con `aria-current="page"`.
- [x] Un usuario FREE ve **Análisis** y **Reportes PDF** con candado; pulsar Análisis hace scroll al banner `#upgrade` y no navega.
- [x] Un usuario PREMIUM ve **Reportes PDF** sin candado y sin navegar (placeholder) hasta su spec.
- [x] `/dashboard/analytics` con PREMIUM renderiza las 8 secciones con datos reales del back (resumen, resumen semanal, tendencia, promedios por periodo, distribución, evolución por categoría, stats por categoría y emergencias).
- [x] Cambiar el selector a 7/30 días actualiza la URL (`?range=`) y la gráfica de tendencia.
- [x] Cambiar el toggle a Semanal/Mensual/Anual actualiza la URL (`?period=`) y los promedios mostrados.
- [x] Un usuario FREE que abre `/dashboard/analytics` es redirigido a `/dashboard#upgrade` y no se hace ninguna request a `/bp-readings/analytics*`.
- [x] El dashboard PREMIUM muestra última medición, pico/mínima de 7 días, promedio semanal con su % de variación, resumen, tendencia a 30 días, últimas lecturas y CTA a Análisis; ya no muestra solo la referencia OMS.
- [x] El pico y la mínima corresponden a la lectura de mayor/menor sistólica de los últimos 7 días con su fecha, y `changePercent` compara la sistólica media de los últimos 7 días con los 7 previos (o `null` sin base).
- [x] El Historial PREMIUM pagina de 20 en 20 con `?page=` y botones Anterior/Siguiente; con 180 lecturas hay 9 páginas y la última no rompe.
- [x] El Historial FREE sigue mostrando hasta 20 lecturas con `ReadingsLimitCard` y sin controles de paginación.
- [x] `grep` del front confirma que no hay promedios, categorizaciones ni agregaciones calculadas en el cliente: todo viene de `/analytics*`.
- [x] Cada gráfica tiene alternativa textual (`figure` + `figcaption` + `role="img"`/`aria-label` + tabla `sr-only`) y no depende solo del color.
- [x] El seed es idempotente: ejecutarlo dos veces deja exactamente 180 lecturas y `admin@tensi.com` en PREMIUM.
- [x] `GET /bp-readings/analytics/weekly-summary` devuelve `peak`/`lowest`/`average`/`changePercent` con sesión Premium y responde 403 con Free.
- [x] No se llama a `POST /bp-readings/evaluate`, a `GET /bp-readings/by-tags` ni al endpoint de export.
- [x] `/dashboard/analytics`, `/dashboard` (Premium) y `/dashboard/history` son usables a 375 px y 1440 px sin scroll horizontal y sin errores de consola.
- [x] No hay etiquetas `<a>`; todos los enlaces usan `next/link`; props con `Readonly<>` y clases canónicas (`pnpm lint` limpio).
- [x] `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build` pasan.
- [x] `git -C ../nest-tensi-api status --short` muestra solo el endpoint de resumen semanal y el script de seed; no hay otros cambios.

> **Verificación (2026-10-05):** los 20 criterios comprobados contra código, API y UI.
>
> - Build/lint: front (`pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`) y back (`pnpm build`, `pnpm lint`) limpios.
> - API: `GET /bp-readings/analytics/weekly-summary` → 200 Premium (`peak`/`lowest`/`average`/`changePercent`) y 403 Free.
> - Seed: `pnpm seed:premium` idempotente (2 ejecuciones → 180 lecturas y PREMIUM).
> - Playwright: Premium ve las 8 secciones y los toggles `?range=`/`?period=`; dashboard con KPIs; Historial 9 páginas (`?page=10` redirige a la 9). Free: candados, scroll a `#upgrade`, `/dashboard/analytics` → `/dashboard#upgrade`, Historial 20/25 + `ReadingsLimitCard` sin controles. 375 y 1440 px sin scroll horizontal ni errores de consola.

## Decisiones

- **Sí:** tocar el back solo para añadir `GET /bp-readings/analytics/weekly-summary`; el resto de endpoints premium se consumen tal cual.
- **Sí:** seed data-only, idempotente y determinista en `prisma/seed-premium-demo.ts`; fija `admin@tensi.com` en PREMIUM y crea ~180 lecturas en ~15 meses.
- **Sí:** navegación según plan con un helper puro (`getNavItemState`) en lugar de un candado estático en los datos de `nav.ts`.
- **Sí:** Reportes PDF queda como placeholder sin candado para Premium hasta su spec; para Free sigue bloqueado hacia el banner.
- **Sí:** Análisis e Historial con Server Components y `searchParams` (`?range`, `?period`, `?page`), URLs compartibles y sin estado cliente.
- **Sí:** reutilizar Recharts y generalizar `ReadingsTrendChart`; no se añaden librerías.
- **Sí:** toggle de promedios por granularidad (una tarjeta que cambia entre semanal/mensual/anual) en vez de tres secciones.
- **Sí:** selector de tendencia con 7 y 30 días, como el mockup.
- **Sí:** endpoint dedicado `weekly-summary` (pico/mínima/promedio/variación) en `BpReadingsAnalyticsService`, en vez de extender `GET /analytics` o enrutar el orquestador `getDashboardAnalytics`.
- **Sí:** el back calcula el pico/mínima y la variación semanal; el front solo formatea (flecha y `±N %`).
- **Sí:** ventana móvil de 7 días frente a los 7 previos para el resumen semanal (coherente con `sevenDaysAgo` del servicio de IA), no semana ISO.
- **No:** paginar Análisis; la paginación de lecturas vive en el Historial.
- **No:** tocar el dashboard Free ni la pantalla de Reportes PDF.
- **No:** tests automatizados (no hay runner en el repo).

## Riesgos

| Riesgo                                                     | Mitigación                                                                                                                  |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Varias llamadas a `/analytics*` en un mismo render         | DAL server-only con `cache()` y `Promise.all`; cada endpoint es una consulta barata                                         |
| `cache()` con argumentos objeto no memoiza de forma fiable | Firmas con primitivos: `getReadingsForSession(skip, limit)` y `getTrendForSession(range)`                                   |
| El seed borra lecturas del usuario demo                    | Es un usuario de prueba; el script lo documenta y solo borra las `BPReading` de `admin@tensi.com`                           |
| Paginación por `?page` con datos que cambian entre páginas | Orden estable del back (`timestamp desc, createdAt desc`); la URL se comparte tal cual                                      |
| Gráfica de evolución por categoría con muchas series       | Agrupar por mes y limitar a las categorías presentes en los datos                                                           |
| SPEC 11 prohíbe hooks en componentes                       | Los toggles son `next/link` (sin estado) y la lógica pura vive en `lib/`; si hiciera falta estado, iría a `lib/**/hooks/**` |
| El plan puede venir cacheado en la sesión tras el seed     | Re-login tras el seed si `check-token` no refleja PREMIUM                                                                   |
| El endpoint nuevo amplía la superficie del back            | Mantenerlo en `BpReadingsAnalyticsService` (premium por guard de clase) y cubrirlo con el criterio 200 Premium / 403 Free   |
| `changePercent` queda `null` con pocos datos               | El seed garantiza lecturas en los últimos 7 días y en los 7 previos; la UI oculta la flecha cuando es `null`                |
| Recharts con React 19 / Server Components                  | Se monta solo en client components; los datos llegan por props desde el servidor                                            |

## Qué **no** entra en esta spec

- Reportes PDF/CSV, su pantalla y `GET /analytics/export`.
- Otros cambios de código en la API (`src/**`) aparte del endpoint de resumen semanal; en `prisma/` solo el script de seed.
- Dashboard Free y su copy.
- Edición/borrado de lecturas y filtros por tags o rango de fechas.
- Evaluación previa al guardado (`POST /bp-readings/evaluate`) y selección de arm/postura.
- Pantalla `Configuración` y demás placeholders.
- Tests automatizados y CSRF.

Cada uno, si se implementa, va en su propia spec.
