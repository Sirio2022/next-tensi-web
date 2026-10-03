# SPEC 08 — Nueva Lectura Free: pantalla visual e interactiva

> **Status:** Aprobado
> **Depends on:** SPEC 03, SPEC 06, SPEC 07
> **Date:** 2026-10-03
> **Objective:** Implementar la pantalla visual de "Nueva Lectura" (plan Free) de `references/dashboard/02-new-reading/free` sobre el shell autenticado existente, con interacción local y sin persistencia ni API.

## Por qué existe esta spec

- El ítem "Nueva Lectura" del sidebar apunta a `#` y el CTA "Registrar Nueva Lectura" del dashboard no navega.
- `references/dashboard/02-new-reading/free` define la pantalla: tres medidores con slider, chips de contexto, notas, fecha/hora, submit y la tarjeta de Análisis IA.
- La UI debe verse terminada aun sin backend, para que la spec de funcionalidad solo reemplace el estado local por datos/API.
- El proyecto aún no tiene `lucide-react`; el mockup usa íconos Lucide. Se homologa la fuente de íconos de UI.

## Alcance

**In:**

- Ruta `app/(dashboard)/dashboard/new-reading/page.tsx` (Server Component) con el título centrado "Agregar Nueva Lectura"; hereda el shell de `(dashboard)` (sidebar + header) **sin cambios de color**.
- Actualizar `lib/dashboard/nav.ts`: `new-reading.href = "/dashboard/new-reading"`.
- Actualizar `app/(dashboard)/dashboard/page.tsx`: el CTA navega a la nueva ruta con `next/link`.
- `components/dashboard/new-reading-form.tsx` (Client Component) con estado local: las tres métricas, chips, notas, fecha/hora de solo lectura y submit no-op.
- `components/dashboard/metric-slider.tsx`: tarjeta de una métrica con valor, `<input type="range">` y etiquetas min/max.
- `components/dashboard/context-chips.tsx`: los 11 chips con multiselección local y estado seleccionado en tokens `tensi`.
- `lib/dashboard/reading-form.ts`: constantes de métricas y de tags de contexto.
- `components/dashboard/ai-analysis-card.tsx` (Server Component estático) con el contenido del mockup corregido.
- `components/ui/button-link.tsx` para el CTA que navega (comparte las clases de `button.tsx`).
- Instalar `lucide-react` y migrar los **íconos genéricos de UI** a sus componentes; conservar SVG de marca e ilustraciones (logo corazón de Tensi, gráfico de tendencia, medidor del calculador).
- Responsive 375px/1440px y accesibilidad (labels, `aria-pressed`, `aria-current`) según SPEC 06.

**Out of scope (para specs futuras):**

- Persistencia, validación, submit real y `POST` a la API Nest.
- Análisis IA real (OpenAI/GPT-OSS) y cuotas (8/10).
- Vista Premium de Nueva Lectura (`references/dashboard/02-new-reading/premium`).
- Historial, Análisis, Reportes PDF y Configuración.
- Cambios de color del sidebar/header: el shell se reutiliza tal cual.
- `@headlessui/react`: ningún componente de esta pantalla lo requiere.
- Drawer móvil y toggle de tema claro/oscuro.

## Modelo de datos

No hay modelos de base de datos ni llamadas a API. Solo constantes de presentación:

```ts
// lib/dashboard/reading-form.ts
export type ReadingMetricId = "systolic" | "diastolic" | "pulse"

export interface ReadingMetric {
  id: ReadingMetricId
  label: string
  unit: "mmHg" | "BPM"
  min: number
  max: number
  defaultValue: number
  /** Clases del acento del slider y del número (semánticas del mockup). */
  accentClassName: string
}

export const READING_METRICS: readonly ReadingMetric[]
export const READING_CONTEXT_TAGS: readonly string[]
```

`READING_METRICS`:

| id          | label              | unit | min | max | default | acento  |
| ----------- | ------------------ | ---- | --- | --- | ------- | ------- |
| `systolic`  | Presión Sistólica  | mmHg | 70  | 200 | 120     | rojo    |
| `diastolic` | Presión Diastólica | mmHg | 40  | 130 | 80      | azul    |
| `pulse`     | Pulso (BPM)        | BPM  | 40  | 180 | 70      | púrpura |

`READING_CONTEXT_TAGS` (11, en orden del mockup): "Ejercicio físico", "Tareas domésticas", "Comí recientemente", "Olvidé medicina", "Estrés / Ansiedad", "Sueño insuficiente", "Fumar", "Cafeína / Alcohol", "Clima frío", "Dolor", "Otras".

## Plan de implementación

1. Instalar `lucide-react` con `pnpm add lucide-react`. Verificación: un import de ícono compila; `pnpm build` verde.
2. Migrar a `lucide-react` los íconos genéricos de UI existentes (`components/dashboard/*`, `components/ui/lock-badge.tsx`, `components/site/*`, `components/landing/features.tsx` y `hero.tsx`, `components/landing/bp-calculator.tsx` (solo el de refrescar), `components/auth/*`, `components/form/password-field.tsx`, `app/(dashboard)/error.tsx` y `dashboard/page.tsx`). Conservar el logo corazón (`sidebar-brand.tsx`, `site-header.tsx`, `auth-header.tsx`) y las ilustraciones (`hero.tsx` gráfico, `bp-calculator.tsx` medidor). Verificación: `grep -rn "<svg" components app` solo encuentra marca/ilustraciones.
3. Crear `lib/dashboard/reading-form.ts` con los tipos y las constantes de arriba.
4. Crear `components/dashboard/metric-slider.tsx`: tarjeta presentacional con `<label>`/`<output>` y acento por prop; props `Readonly<>`.
5. Crear `components/dashboard/context-chips.tsx`: `selected: readonly string[]` + `onToggle`, chips como `<button type="button" aria-pressed>`.
6. Crear `components/dashboard/new-reading-form.tsx` (client): estado de las tres métricas, tags, notas y la fecha/hora de solo lectura; `onSubmit` con `preventDefault`, sin persistir.
7. Crear `components/dashboard/ai-analysis-card.tsx`: bloque estático con 8/10 restantes, 65%, declaración "NORMAL" y CTA Premium; copy sin `**` literales.
8. Extraer las clases de `components/ui/button.tsx` y crear `components/ui/button-link.tsx` (renderiza `next/link` con las mismas clases).
9. Crear `app/(dashboard)/dashboard/new-reading/page.tsx` (Server Component, `metadata.title = "Nueva Lectura"`) que compone el formulario y la tarjeta IA centrados en `max-w-2xl`.
10. Actualizar `lib/dashboard/nav.ts`: `new-reading.href = "/dashboard/new-reading"`.
11. Actualizar `app/(dashboard)/dashboard/page.tsx`: el CTA "Registrar Nueva Lectura" navega con `button-link.tsx` a la nueva ruta.
12. Repasar responsive y accesibilidad a 375px/1440px: sin scroll horizontal, foco visible, labels asociados.

## Criterios de aceptación

> Verificado con Playwright (`.playwright-mcp/08-verify-new-reading-1440.png`, `.playwright-mcp/08-verify-new-reading-375.png`) y `pnpm lint` / `pnpm exec tsc --noEmit` / `pnpm build` (todos en verde).

- [x] `GET /dashboard/new-reading` con sesión válida renderiza la pantalla según `references/dashboard/02-new-reading/free/screenshot1.png`. (Screenshot 1440 vs. mockup: layout coincide.)
- [x] La pantalla reutiliza el shell de `(dashboard)`; sidebar y header conservan sus colores actuales. (`git diff` del shell: sin cambios de color.)
- [x] "Nueva Lectura" aparece activo con tokens `tensi` y `aria-current="page"`. (DOM: `aria-current="page"` + `border-tensi-500/20 bg-tensi-600/10 text-tensi-400`. Requirió corregir `dashboard-sidebar.tsx`, ver Nota de corrección.)
- [x] El ítem "Nueva Lectura" del sidebar y el CTA del dashboard navegan a `/dashboard/new-reading`. (CTA y sidebar verificados por clic.)
- [x] Las tres tarjetas muestran 120 mmHg, 80 mmHg y 70 BPM con rangos 70–200, 40–130 y 40–180. (DOM: `min`/`max`/`value` y outputs 120/80/70.)
- [x] Al mover cada slider, el número mostrado se actualiza. (150/95/120 → outputs 150/95/120.)
- [x] El campo Pulso muestra `BPM` (se corrige el `mmHg` del mockup).
- [x] Los 11 chips de contexto alternan selección (multiselección) y exponen `aria-pressed`. (11 chips; `aria-pressed` alterna `true`/`false`.)
- [x] El input de Notas y el de fecha/hora (solo lectura, formato del mockup) se renderizan. (placeholder "Notas adicionales (opcional)"; datetime `readOnly` `01/10/2026, 09:38 a.m.`.)
- [x] El botón "Agregar Lectura" no envía, no navega ni muta estado. (Tras clic: URL y estado de notas/systolic sin cambios.)
- [x] La tarjeta "Análisis IA con OpenAI GPT-OSS" es estática y muestra 8/10, 65% y "NORMAL", sin `**` literales ni el typo `Premium:**`.
- [x] `lucide-react` está instalado y los íconos genéricos de UI lo consumen; los SVG de marca e ilustraciones se conservan. (`package.json` → `lucide-react`; `<svg>` restantes = marca/ilustraciones.)
- [x] No hay etiquetas `<a>`; toda la navegación usa `next/link`.
- [x] Todos los componentes declaran props con `Readonly<>`; `better-tailwindcss/enforce-canonical-classes` pasa. (`pnpm lint` exit 0.)
- [x] No se dispara ninguna petición adicional a la API Nest desde la pantalla (más allá del `check-token` de sesión del shell, preexistente y fuera del alcance de esta spec). (Recursos de red a `:3002` al cargar la ruta: `[]`.)
- [x] `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build` pasan. (Los tres en verde; `/dashboard/new-reading` aparece en el árbol de rutas.)
- [x] Usable a 375px y 1440px sin scroll horizontal y sin errores en consola. (375px: `docScrollWidth=375`; consola: 0 errores/warnings.)

### Nota de corrección — `components/dashboard/dashboard-sidebar.tsx`

La lógica de activo usaba `pathname.startsWith(`${item.href}/`)`, por lo que en `/dashboard/new-reading` se marcaba **también** "Dashboard" con `aria-current="page"` (dos ítems activos). Se reemplazó por un helper `getActiveNavId()` que resuelve el activo por **prefijo más específico** (longest-prefix). Re-verificado por DOM: solo "Nueva Lectura" queda activo.

> Estado de la spec: se mantiene `Aprobado`. El agente `spec-verifier` no modifica el estado (`Draft`/`Approved`/`Implemented`); esa decisión corresponde al humano.

## Decisiones

- **Sí:** ruta `/dashboard/new-reading`. Cuelga del grupo `(dashboard)` y reutiliza el id `new-reading` del nav.
- **Sí:** interacción local con `useState` (sliders, chips). Se ve y se siente real sin tocar API; la "funcionalidad" queda para su spec.
- **No:** persistencia, validación o submit real. Van en la spec de funcionalidad.
- **Sí:** `lucide-react` como fuente de íconos de UI; **no** migrar marca ni ilustraciones (logo corazón, gráfico, medidor) para no alterar la identidad visual.
- **No:** instalar `@headlessui/react` en esta spec; ningún control lo requiere.
- **Sí:** incluir la tarjeta de Análisis IA como bloque visual estático y corregir el copy del mockup.
- **Sí:** unidad `BPM` para el pulso (corrige el error del mockup).
- **Sí:** conservar los acentos semánticos del mockup en el formulario (rojo/azul/púrpura); el sidebar sigue en `tensi`.
- **Sí:** fecha/hora como texto de solo lectura con el formato del mockup; el "ahora" real entra en la spec de funcionalidad.
- **Sí:** chips de multiselección; el contexto suele ser múltiple.
- **Sí:** submit no-op visual (verde activo), sin `disabled`, porque es una pantalla de diseño.
- **No:** modificar los colores del shell ni el título "Panel Principal" del header.

## Riesgos

| Riesgo                                                               | Mitigación                                                                      |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| El botón "Mejorar Plan" del header apunta a `#upgrade`, ausente aquí | Es un no-op inocuo; se documenta y se resuelve cuando exista flujo de upgrade   |
| `lucide-react` con React 19 / Server Components                      | Verificar `pnpm build` tras instalar; importar íconos nombrados                 |
| La migración masiva de íconos cambia tamaños o alineación            | Revisar cada pantalla en Playwright (375/1440) contra las capturas previas      |
| El Client Component suma bundle a una ruta sin datos                 | Mantener la interactividad acotada al formulario; la tarjeta IA queda en server |
| `aria-pressed` en chips puede leerse como toggle de formulario       | `type="button"` explícito y `aria-label` del grupo                              |

## Qué **no** entra en esta spec

- Persistencia, validación y guardado de la lectura.
- Análisis IA real y cuotas de uso.
- Vista Premium de Nueva Lectura.
- Historial, Análisis, Reportes PDF y Configuración.
- Cambios de color del shell o del header.
- `@headlessui/react`, drawer móvil y toggle de tema.

Cada uno, si se implementa, va en su propia spec.
