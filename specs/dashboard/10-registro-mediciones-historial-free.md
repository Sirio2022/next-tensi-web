# SPEC 10 — Registro de mediciones, análisis IA, gráficas e historial (plan Free)

> **Status:** Aprobado
> **Depends on:** SPEC 01, SPEC 03, SPEC 06, SPEC 08
> **Date:** 2026-10-04
> **Objective:** Integrar el registro real de mediciones y el historial del plan Free contra la API Nest existente (sin cambios en el back), con validación en el front, análisis IA real, alerta de emergencia, gráficas en el dashboard y pantalla de Historial.

## Por qué existe esta spec

- SPEC 08 dejó `/dashboard/new-reading` como pantalla visual: sliders, chips, notas y submit no-op, sin persistencia ni API.
- SPEC 03 dejó `/dashboard` con estado vacío y banner estáticos; el sidebar marca `Historial` con `href: "#"`.
- La API Nest ya tiene todo lo necesario para el plan Free: `POST /bp-readings` (crea y devuelve `reading` + `emergencyAssessment` + `analysis`), `GET /bp-readings` (lista con límite Free) y `POST /bp-readings/evaluate`. No hay que tocar el back.
- Todos los cálculos de dominio (categoría WHO, evaluación de emergencia, cuota IA, agregaciones) los hace el back. El front nunca calcula métricas de salud.
- El usuario quiere que Free sea un "escaparate" que enganche a Premium (gráfica real + lo que está bloqueado), y quiere el Historial resuelto en esta misma spec.

## Alcance

**In:**

- **Registro real** en `/dashboard/new-reading` con `POST /api/bp-readings`: sliders, chips de contexto → `tags`, `notes`, `timestamp` = "ahora" (solo lectura) y submit con validación zod.
- **Análisis IA real** en la misma pantalla tras guardar: `insight`, `confidence`, `patterns` y el mensaje de cuota del back. Antes del primer submit, estado vacío explicativo.
- **Alerta de emergencia** a partir de `emergencyAssessment`: diálogo modal en crisis (`CRISIS_HYPERTENSIVE`/`CRISIS_HYPOTENSIVE`) y aviso inline en `WARNING`.
- **Dashboard Free con datos reales** (`app/(dashboard)/dashboard/page.tsx`): KPI de última medición, gráfica de evolución de las 20 lecturas visibles, contador `visible/total` con lecturas ocultas, teaser bloqueado de analíticas Premium y banner de upgrade. Estado vacío solo si `total === 0`.
- **Pantalla de Historial** (`app/(dashboard)/dashboard/history/page.tsx`): listado de solo lectura de las lecturas visibles (valores, pulso, categoría, tags, notas y fecha), aviso de límite Free con `hiddenReadings` + CTA, y estado vacío.
- **Cliente de datos**: `lib/readings/` (`types`, `schemas`, `readings.api`, `dal` server-only, `categories`, hook de mutación).
- **Gráfica con `recharts`** en un client component, alimentado por props desde el Server Component.
- **Navegación**: `history.href = "/dashboard/history"` en `lib/dashboard/nav.ts`; el CTA del estado vacío navega a Nueva Lectura.
- Responsive 375/1440 y accesibilidad según SPEC 06 (alternativa textual de la gráfica, foco en el diálogo, labels).

**Out of scope (para specs futuras):**

- **Cambios en `nest-tensi-api`.** Se consumen endpoints existentes tal cual.
- **Dashboard Premium**: KPIs avanzados, promedios semanales/mensuales, distribución por categoría, `analytics/*` y export PDF/CSV. Va en su propia spec.
- **Mejores recomendaciones de IA para Premium** (`USE_AI_FOR_PREMIUM`, OpenRouter). Va en su propia spec.
- Pantallas `Análisis`, `Reportes PDF` y `Configuración`.
- Edición o borrado de lecturas (el back no expone `PATCH`/`DELETE` de `bp-readings`).
- Filtros del historial por tags o rango de fechas. `GET /bp-readings/by-tags` **no** aplica el límite Free, así que no se usa (ver Riesgos).
- Evaluación previa al guardado con `POST /bp-readings/evaluate`.
- Selector de periodo 7/30 días en la gráfica Free (se reserva como gancho Premium).
- Cuota IA numérica "X/10" siempre visible: el back solo devuelve `usageCount` al agotar la cuota.
- `@headlessui/react`: el diálogo usa `<dialog>` nativo.
- Tests automatizados (el repo no tiene runner) y CSRF.

## Modelo de datos

No hay modelos de base de datos nuevos. El front tipa el contrato que ya devuelve la API Nest.

`lib/readings/types.ts` (espejo de `bp-readings.service.ts`, `ai-insight.dto.ts` y `bp-emergency-evaluator.util.ts`):

```ts
export type BloodPressureCategory =
  | "severe_hypotension"
  | "moderate_hypotension"
  | "mild_hypotension"
  | "optimal"
  | "normal"
  | "high_normal"
  | "grade_1_hypertension"
  | "grade_2_hypertension"
  | "grade_3_hypertension"

export type EmergencySeverity =
  | "NORMAL"
  | "WARNING"
  | "CRISIS_HYPERTENSIVE"
  | "CRISIS_HYPOTENSIVE"

export type EmergencyAction = "NONE" | "CONSULT_DOCTOR" | "SEEK_IMMEDIATE_CARE"

export interface EmergencyAssessment {
  isEmergency: boolean
  severity: EmergencySeverity
  category: BloodPressureCategory
  actionRequired: EmergencyAction
  uiMessage: {
    title: string
    body: string
    primaryButtonText: string
  }
}

export interface BPReading {
  id: string
  systolic: number
  diastolic: number
  pulse: number | null
  notes: string | null
  category: BloodPressureCategory
  tags: string[]
  arm: "RIGHT" | "LEFT"
  posture: "SITTING" | "STANDING" | "LYING_DOWN"
  irregularHeartBeat: boolean
  userId: string
  timestamp: string
  createdAt: string
  updatedAt: string
}

export interface AIInsight {
  insight: string
  confidence: number
  patterns?: string[]
  /** Solo viene cuando el back corta por cuota agotada. */
  usageCount?: number
  error?: string
}

export interface CreateReadingResponse {
  reading: BPReading
  emergencyAssessment: EmergencyAssessment
  analysis: AIInsight
}

/** `GET /api/bp-readings` (ramas Free y Premium del servicio). */
export interface ReadingsMeta {
  total: number
  visible: number
  hiddenReadings: number
  skip: number
  limit: number
  hasMore: boolean
  isFreePlan: boolean
  requiresUpgrade?: boolean
}

export interface ReadingsResponse {
  data: BPReading[]
  meta: ReadingsMeta
}

export interface CreateReadingInput {
  systolic: number
  diastolic: number
  pulse?: number
  notes?: string
  tags?: string[]
  timestamp?: string
}
```

`lib/readings/schemas.ts`: schema zod que replica `CreateBPReadingDto` (sistólica entera 50–250, diastólica entera 30–150, `systolic > diastolic`, pulso entero 30–220 opcional, notas string opcional, tags string[] opcional, timestamp ISO opcional). Es la única fuente de validación del cliente.

`lib/readings/categories.ts`: mapa de solo presentación `BloodPressureCategory → { label, tone }`. **No** duplica rangos numéricos (eso vive en el back y en `lib/bp/bp-categories.ts`).

| categoría              | label                | tone         |
| ---------------------- | -------------------- | ------------ |
| `severe_hypotension`   | Hipotensión Severa   | rose         |
| `moderate_hypotension` | Hipotensión Moderada | orange       |
| `mild_hypotension`     | Hipotensión Leve     | sky          |
| `optimal`              | Óptima               | emerald      |
| `normal`               | Normal               | emerald-soft |
| `high_normal`          | Normal Alta          | amber        |
| `grade_1_hypertension` | Hipertensión 1       | orange       |
| `grade_2_hypertension` | Hipertensión 2       | rose         |
| `grade_3_hypertension` | Hipertensión 3       | rose         |

Regla de cálculo explícita: el front **solo formatea** (fechas con `Intl.DateTimeFormat`, ratio `confidence` 0–1 → porcentaje, categoría → label/color). **Nunca** agrega promedios, ni categoriza valores, ni recalcula emergencias.

## Plan de implementación

Todo el trabajo es en `next-tensi-web`.

1. Instalar `recharts` con `pnpm add recharts`. Verificación: un import de `LineChart` compila y `pnpm build` pasa con React 19 (usar Recharts 3.x).
2. Crear `lib/readings/types.ts` con los tipos de arriba.
3. Crear `lib/readings/schemas.ts` con el schema zod del formulario y el `refine` `systolic > diastolic`.
4. Crear `lib/readings/readings.api.ts`: `getReadings(client?)` (`GET /bp-readings`) y `createReading(input, client?)` (`POST /bp-readings`) sobre la interfaz `HttpClient`.
5. Crear `lib/readings/dal.ts`: `getReadingsForSession()` server-only, memoizado con `cache()` y reenviando el header `Cookie` (mismo patrón que `verifySession`); devuelve `ReadingsResponse | null` (null en 401/403).
6. Crear `lib/readings/categories.ts` con el mapa de la tabla.
7. Crear `lib/readings/hooks/use-create-reading.ts` (client): `useMutation` de TanStack que llama `createReading` y expone `data`/`error`/`isPending`; no navega.
8. Crear `components/dashboard/emergency-alert-dialog.tsx` (client): `<dialog>` nativo con `showModal()`, `aria-labelledby`/`aria-describedby`, cierre con el botón primario; recibe `EmergencyAssessment` y `open`/`onClose` con props `Readonly<>`.
9. Crear `components/dashboard/ai-insight-text.tsx`: formatea de forma segura `**negritas**` y saltos de línea del `insight` a `<strong>`/`<p>` (sin `dangerouslySetInnerHTML`).
10. Reescribir `components/dashboard/ai-analysis-card.tsx` para aceptar `analysis?: AIInsight`: estado vacío explicativo si falta; con datos, renderiza insight, `confidence`, `patterns`, cuota (`usageCount`) o el error de límite con CTA Premium.
11. Crear `components/dashboard/readings-trend-chart.tsx` (client, Recharts): props `readings: readonly BPReading[]`; dos series (sistólica/diastólica) por `timestamp`, tooltip con valores y categoría; `figure` + `figcaption` + `role="img"`/`aria-label` y tabla `<table>` visualmente oculta con los mismos datos.
12. Crear `components/dashboard/last-reading-card.tsx`: KPI "Última medición" con valores, `Badge` de categoría, pulso y fecha (solo lectura del back).
13. Crear `components/dashboard/readings-limit-card.tsx`: "N de M lecturas en Free" desde `meta.visible`/`meta.total`, y "N ocultas" + CTA Premium cuando `meta.requiresUpgrade`.
14. Crear `components/dashboard/premium-analytics-teaser.tsx`: bloque estático difuminado con candado que anuncia promedios, tendencias y PDF, con CTA a Premium.
15. Reescribir `components/dashboard/new-reading-form.tsx` (client): React Hook Form + `zodResolver` (con `Controller` para sliders/chips), `useCreateReading`, fecha/hora actual de solo lectura, `notes` en `<textarea>` y submit real. Al éxito, muestra el `AiAnalysisCard` real, abre el diálogo de emergencia según `severity` (o aviso inline en `WARNING`), confirma el guardado y ofrece enlaces a Dashboard e Historial. Deshabilita el submit mientras `isPending`.
16. Crear `app/(dashboard)/dashboard/history/page.tsx` (Server Component, `metadata.title = "Historial"`) y `components/dashboard/readings-history-list.tsx`: lista las lecturas visibles con `Badge` de categoría, valores, pulso, tags, notas y fecha; aviso de límite Free con `hiddenReadings` + CTA; estado vacío.
17. Reescribir `app/(dashboard)/dashboard/page.tsx`: leer `getReadingsForSession()`; si `meta.total === 0`, `EmptyReadingsCard` + `UpgradeBanner`; si no, `LastReadingCard`, `ReadingsTrendChart`, `ReadingsLimitCard`, `PremiumAnalyticsTeaser`, `UpgradeBanner` y `BpRangesReference`.
18. Actualizar `lib/dashboard/nav.ts`: `history.href = "/dashboard/history"`; y `components/dashboard/empty-readings-card.tsx` para que su CTA navegue (con `ButtonLink`) a `/dashboard/new-reading` sin `disabled`.
19. Repasar responsive 375/1440, accesibilidad (alternativa textual de la gráfica, foco y Escape en el diálogo, labels de sliders y `aria-pressed` de chips) y convenciones (sin `<a>`, props `Readonly<>`, clases canónicas de Tailwind); ejecutar `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build`.

## Criterios de aceptación

- [ ] `pnpm add recharts` deja la dependencia en `package.json` y `pnpm build` compila con React 19.
- [ ] `POST /api/bp-readings` con sesión válida crea la lectura y esta aparece después en `GET /api/bp-readings`. (Playwright: submit → red real 201 → recarga del dashboard con la nueva lectura.)
- [ ] Un submit inválido (p. ej. sistólica ≤ diastólica o fuera de rango) no dispara ninguna request a `:3002` y muestra el error de zod bajo el campo.
- [ ] La fecha/hora se muestra en solo lectura con el "ahora" real y el `timestamp` enviado es ISO (`new Date().toISOString()`).
- [ ] El textarea de Notas se envía en `notes` y se persiste (visible luego en el Historial).
- [ ] Los chips seleccionados se envían en `tags`; el back los normaliza (minúsculas, sin tildes) y así se muestran en el Historial.
- [ ] Tras guardar, la tarjeta de Análisis IA muestra el `insight` real del back con `confidence` formateada y los `patterns`; el `**` se renderiza como negrita y no como texto literal.
- [ ] Antes del primer submit la tarjeta de IA muestra un estado vacío, no datos del mockup.
- [ ] Una lectura de crisis abre el diálogo con el `uiMessage` del back (`title`/`body`/`primaryButtonText`); Escape y el botón lo cierran y el foco vuelve al submit.
- [ ] Una lectura `WARNING` muestra un aviso inline (sin modal).
- [ ] Al agotar la cuota, la tarjeta muestra el `error` del back y un CTA Premium; en caso contrario **no** inventa un "X/10".
- [ ] El dashboard, con `meta.total > 0`, muestra la KPI de última medición, la gráfica y el contador `visible/total` sin recalcular nada en el front.
- [ ] La gráfica usa exclusivamente `systolic`, `diastolic`, `timestamp` y `category` tal como llegan del back; no hay agregaciones ni promedios en el cliente.
- [ ] Con `meta.requiresUpgrade = true`, el contador y el teaser Premium muestran las lecturas ocultas y el CTA de upgrade.
- [ ] Con `meta.total === 0`, el dashboard muestra el estado vacío y su CTA navega a `/dashboard/new-reading`.
- [ ] `/dashboard/history` lista las lecturas visibles con categoría, valores, pulso, tags, notas y fecha; con `requiresUpgrade` muestra el aviso de límite Free + CTA; sin lecturas muestra estado vacío.
- [ ] El ítem "Historial" del sidebar navega a `/dashboard/history` y queda activo con `aria-current="page"`.
- [ ] No se llama a ningún endpoint de `/bp-readings/analytics/*` (403 para Free).
- [ ] La gráfica tiene alternativa textual (caption + `aria-label` + tabla oculta) y no depende solo del color.
- [ ] Usable a 375px y 1440px sin scroll horizontal y sin errores en consola.
- [ ] No hay etiquetas `<a>`; todos los enlaces usan `next/link`.
- [ ] Todos los componentes declaran props con `Readonly<>` y usan clases canónicas de Tailwind.
- [ ] `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build` pasan.
- [ ] `git -C ../nest-tensi-api status --short` no muestra cambios: el back no se toca.

## Decisiones

- **No:** modificar `nest-tensi-api`. Se consumen los endpoints existentes; el back es la fuente única de todos los cálculos.
- **Sí:** gráfica Free a partir de las **lecturas crudas** de `GET /bp-readings` (máx. 20). Es lo único que un usuario Free puede leer; graficar puntos no es calcular.
- **No:** usar `analytics/*` para Free. Está cerrado por `PremiumPlanGuard` (403) y su versión avanzada es el gancho Premium.
- **No:** promedios ni KPIs agregados en el front. La KPI de esta spec es "última medición" (dato directo); los promedios quedan para Premium.
- **No:** selector de periodo 7/30 días en Free. Se reserva como gancho Premium (el mockup lo tenía en la vista Premium).
- **No:** cuota IA numérica "X/10" salvo que el back la reporte. Sin cambios en el back, la tarjeta solo muestra el límite cuando se agota.
- **Sí:** `recharts` (SVG, declarativa, React 19) por encima de Chart.js/canvas (peor accesibilidad) y de librerías de bajo nivel.
- **Sí:** reads por Server Component con `getReadingsForSession()` (reenvío de cookie, memoizado) y escrituras por `useMutation` en cliente, como `useAuth`.
- **Sí:** quedarse en Nueva Lectura tras guardar y mostrar el análisis + alerta; el análisis IA no se persiste, así que no puede mostrarse en el dashboard.
- **Sí:** teaser Premium en el dashboard en lugar de un insight IA irreal: el back no persiste el análisis.
- **Sí:** Historial de solo lectura con `GET /bp-readings`. El back no expone borrado/edición.
- **No:** filtros de Historial por tags. `by-tags` no aplica el límite Free y filtraría lecturas ocultas.
- **Sí:** diálogo de emergencia con `<dialog>` nativo (sin `@headlessui/react`) y nota en negritas parseada sin `dangerouslySetInnerHTML`.
- **Sí:** `timestamp` automático "ahora" en solo lectura; registrar tomas pasadas queda fuera.
- **Sí:** `notes` como `<textarea>`; el back ya admite `@db.Text`.

## Riesgos

| Riesgo                                                                    | Mitigación                                                                                             |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Recharts rompe con React 19 / Server Components                           | Instalar Recharts 3.x y montarlo solo en un client component; datos por props desde el server          |
| La gráfica SVG no es accesible por lectores de pantalla                   | `figure` + `figcaption`, `role="img"`/`aria-label` y tabla `<table>` oculta con los mismos datos       |
| El `insight` puede traer `**`, saltos y emojis                            | Parser propio a `<strong>`/`<p>`; prohibido `dangerouslySetInnerHTML` (regla `react/no-danger`)        |
| Un Free podría ver más de 20 lecturas por usar `by-tags`                  | No se usa `by-tags` en esta spec; el Historial solo consume `GET /bp-readings`                         |
| Llamar `analytics/*` por error devuelve 403 y rompe el dashboard          | Solo se consume `GET /bp-readings`; se documenta y se verifica que no haya requests a `analytics`      |
| Escribir la categoría por rangos en el front duplicaría la tabla del back | `categories.ts` solo mapea enum → label/color; los números viven en el back                            |
| Sliders gobernados por RHF `Controller` añaden complejidad                | Mantener un `use-new-reading-form` acotado y reutilizar `MetricSlider`/`ContextChips` presentacionales |
| El POST puede tardar si la IA tarda                                       | El plan Free usa fallback inmediato (sin OpenRouter); el submit muestra estado `isPending`             |

## Qué **no** entra en esta spec

- Cambios en `nest-tensi-api`.
- Dashboard Premium (KPIs avanzados, promedios semanales/mensuales, distribución, PDF/CSV) y mejores recomendaciones de IA.
- Pantallas `Análisis`, `Reportes PDF` y `Configuración`.
- Edición/borrado de lecturas.
- Filtros del historial por tags o rango de fechas.
- Evaluación previa al guardado (`POST /bp-readings/evaluate`).
- Selector de periodo y cuota IA numérica permanente.
- Tests automatizados y CSRF.

Cada uno, si se implementa, va en su propia spec.
