# SPEC 02 — Landing pública con modales de autenticación

> **Status:** Implementado
> **Depends on:** SPEC 01
> **Date:** 2026-10-01
> **Objective:** Implementar la landing pública de Tensi según `references/01-landing`, con la calculadora de presión y los modales de login/registro que reutilizan los formularios de la SPEC 01.

## Por qué existe esta spec

- La landing es la puerta de entrada al producto; hoy `app/page.tsx` es scaffolding de `create-next-app`.
- El mockup no es estático: embebe los formularios de auth en dos modales y una calculadora con lógica propia.
- La lógica `calculateBP()` del mockup **diverge** del backend (`bp-categorizer.util.ts`) y produce clasificaciones incorrectas.

## Alcance

**In:**

- Reemplazar `app/page.tsx` por la landing (Server Component) con: header/nav, hero + tarjeta mock de dashboard, 3 features, calculadora, CTA y footer.
- `SiteHeader` y `SiteFooter` reutilizables (el footer se comparte con las pantallas de auth).
- `useBpCalculator` como hook que espeja las 9 categorías WHO del backend; la UI colapsa a buckets visuales.
- Modales de login y registro que montan los mismos `use-*-form` + `FormField` de la SPEC 01.
- Sistema de toasts para el feedback posterior al registro.
- Navegación por anclas (`#caracteristicas`, `#simulador`, `#tendencias`, `#contacto`) con scroll suave y `scroll-margin-top` por el header fijo.

**Out of scope (para specs futuras):**

- Autenticación real y rutas de auth (SPEC 01).
- OAuth Google/GitHub.
- Datos reales de tendencias/dashboard (el mock del hero es estático).
- Páginas de Términos y Privacidad (hoy son `href="#"`).
- Persistir las lecturas de la calculadora o llamar a `bp-readings`.
- SEO avanzado, i18n y analítica.

## Modelo de datos

No hay modelos de base de datos nuevos. Se reutilizan `AuthUser` y los formularios de la SPEC 01.

Tipos nuevos (`lib/bp/bp-categories.ts`):

```ts
// Espejo de BloodPressureCategory de prisma/schema.prisma
export type BpCategory =
  | "severe_hypotension"
  | "moderate_hypotension"
  | "mild_hypotension"
  | "optimal"
  | "normal"
  | "high_normal"
  | "grade_1_hypertension"
  | "grade_2_hypertension"
  | "grade_3_hypertension"

// Buckets visuales de la landing
export type BpVisualBucket =
  | "saludable"
  | "atencion"
  | "riesgo_moderado"
  | "consultar_medico"
  | "presion_baja"
```

Mapeo `BpCategory → BpVisualBucket`:

| Categoría backend                                                | Bucket             | Color   |
| ---------------------------------------------------------------- | ------------------ | ------- |
| `optimal`, `normal`                                              | `saludable`        | emerald |
| `high_normal`                                                    | `atencion`         | amber   |
| `grade_1_hypertension`                                           | `riesgo_moderado`  | orange  |
| `grade_2_hypertension`, `grade_3_hypertension`                   | `consultar_medico` | rose    |
| `mild_hypotension`, `moderate_hypotension`, `severe_hypotension` | `presion_baja`     | sky     |

El bucket `presion_baja` **no existe en el mockup**; se agrega porque las tres hipotensiones no tenían representación.

Regla de categorización a replicar (idéntica a `BloodPressureCategorizer`): se recorre de la más severa a la menos; para hipertensión basta con que **una** de las dos (sistólica **o** diastólica) caiga en el rango, para hipotensión deben caer **ambas**.

## Plan de implementación

1. Crear `lib/bp/bp-categories.ts` con la tabla de rangos, `categorize(sys, dia)` y el mapeo a buckets. Debe replicar el OR/AND del backend. Verificación: 118/78 → `optimal`, 90/60 → `mild_hypotension`.
2. Crear `lib/bp/hooks/use-bp-calculator.ts`: inputs controlados, categoría y bucket resultantes, estado vacío.
3. Crear `components/landing/bp-calculator.tsx` presentacional que consume el hook.
4. Crear `components/site/site-footer.tsx` y usarlo también en `app/(auth)/layout.tsx` (refactor del footer de la SPEC 01).
5. Crear `components/site/site-header.tsx` con las anclas y los botones que disparan `openLogin`/`openRegister`.
6. Crear `components/site/auth-modals.tsx`: `AuthModalsProvider` con contexto (`openLogin`, `openRegister`, `close`) y los dos modales que montan `LoginForm` y `RegisterForm` de la SPEC 01.
7. Crear `components/site/toast.tsx` + `useToast` y mostrar el mensaje tras un registro exitoso.
8. Crear las secciones presentacionales: hero con la tarjeta mock (118/78, 72 BPM), 3 features (Registra / Analiza / Comparte) y CTA final.
9. Componer `app/page.tsx` (Server Component): header + secciones + footer dentro de `AuthModalsProvider`.
10. Añadir accesibilidad de modales (foco, Escape, click en backdrop, `aria-modal`) y responsive (nav colapsable a 375px).

## Criterios de aceptación

- [x] `GET /` renderiza la landing sin errores en consola. _(Verificado en Playwright: 3 mensajes en consola, 0 errores y 0 warnings.)_
- [x] Las anclas `#caracteristicas`, `#simulador` y `#tendencias` llevan a su sección. _(Verificado: click real en cada ancla deja la sección a 80px del top, bajo el header sticky, gracias a `scroll-mt-20`.)_
- [x] "Iniciar Sesión" abre el modal de login; "Comenzar Gratis" y "Crear Cuenta Gratis" abren el de registro. _(Verificado en Playwright: los diálogos resultantes son "Iniciar Sesión" y "Crear Cuenta Gratis" respectivamente.)_
- [x] Ambos modales cierran con Escape, con click en el backdrop y con el botón de cierre. _(Verificado: Escape real, click en el backdrop y botón `aria-label="Cerrar"` dejan ausente `[role="dialog"]` en los dos modales.)_
- [x] El modal de registro llama a `POST /api/auth/register`, muestra el toast y navega a `/verify-account`. _(Verificado E2E: `POST :3002/api/auth/register => 201`, toast "Cuenta creada con éxito" y URL `/verify-account?email=...`; screenshot `.playwright-mcp/spec02-register-toast.png`.)_
- [x] El modal de login autentica con la lógica de la SPEC 01 y navega a `/dashboard`. _(Verificado E2E con el admin del seed: `POST :3002/api/auth/login => 200` y URL `/dashboard` (Admin, <admin@tensi.com>); screenshot `.playwright-mcp/spec02-login-dashboard.png`.)_
- [x] `categorize(118, 78)` devuelve `optimal` y el bucket `saludable`. _(Verificado con el script de paridad: `optimal` / `saludable`.)_
- [x] `categorize(135, 85)` devuelve `high_normal` y el bucket `atencion`. _(Verificado: `high_normal` / `atencion`.)_
- [x] `categorize(145, 92)` devuelve `grade_1_hypertension`. _(Verificado: `grade_1_hypertension`.)_
- [x] `categorize(165, 105)` devuelve `grade_2_hypertension`. _(Verificado: `grade_2_hypertension`.)_
- [x] `categorize(90, 60)` devuelve `mild_hypotension` y el bucket `presion_baja` (no "Hipertensión Nivel 2"). _(Verificado: `mild_hypotension` / `presion_baja`.)_
- [x] Los resultados de `categorize()` coinciden con `BloodPressureCategorizer.categorize()` del backend para la matriz completa de rangos. _(Verificado: sys 0–250 × dia 0–150 = 37.901 combinaciones, 0 discrepancias contra el `dist` del backend; script `.playwright-mcp/spec02-parity.mjs`.)_
- [x] Los componentes de la landing no contienen lógica de cálculo ni validaciones. _(Verificado por grep en `components/landing`: sin `categorize`/`zod`/`Number(`/`parse*`/regex; `BpCalculator` solo consume `useBpCalculator`.)_
- [x] La landing usa los mismos tokens de color que las pantallas de auth. _(Verificado por grep: `tensi-*` en landing y auth, sin `cyan-*`/`brand-*` ni hex crudos; se normalizaron a tokens los dos `stroke` del SVG de tendencia en `hero.tsx`.)_
- [x] Usable a 375px y 1440px sin scroll horizontal. _(Verificado: `document.documentElement.scrollWidth == window.innerWidth` a 375 y a 1440; screenshots `.playwright-mcp/spec02-375.png` y `.playwright-mcp/spec02-1440.png`.)_
- [x] `pnpm lint` y `pnpm exec tsc --noEmit` pasan. _(Verificado: `eslint` exit 0 y `tsc --noEmit` exit 0.)_

## Decisiones

- **Sí:** spec separada. Marketing y autenticación son dos objetivos distintos.
- **Sí:** los modales reutilizan `LoginForm`/`RegisterForm` de la SPEC 01. Cero duplicación. Por eso SPEC 02 depende de SPEC 01.
- **Sí:** `useBpCalculator` espeja el backend y la UI colapsa 9 categorías a 5 buckets.
- **Sí:** bucket `presion_baja` nuevo, porque el mockup no contempla hipotensión.
- **No:** copiar `calculateBP()` del mockup. Clasifica mal `90/60` y llama "Hipertensión Nivel 1" a lo que el backend considera `high_normal`.
- **No:** que los CTA naveguen a las rutas. Se mantienen los modales del mockup.
- **No:** persistir las lecturas de la calculadora. Es un simulador, no un registro.
- **No:** OAuth.

## Riesgos

| Riesgo                                                               | Mitigación                                                                                                                         |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `categorize()` duplica la lógica del backend y puede desincronizarse | Tabla de rangos en un solo archivo y criterio de aceptación que la compara contra el backend; a futuro, endpoint de categorización |
| Concentración de foco y accesibilidad de los modales                 | Usar `<dialog>` nativo o una implementación con trampa de foco; verificar teclado                                                  |
| Dependencia dura de SPEC 01                                          | Si cambia la firma de los formularios de la 01, la 02 se rompe; congelar esas props antes de implementar                           |
| El header fijo tapa el destino de las anclas                         | `scroll-margin-top` en cada sección y `scroll-behavior: smooth`                                                                    |

## Qué **no** entra en esta spec

- Autenticación real y OAuth.
- Tendencias y dashboard reales.
- Páginas de Términos y Privacidad.
- Persistencia de la calculadora.
- SEO avanzado e i18n.
