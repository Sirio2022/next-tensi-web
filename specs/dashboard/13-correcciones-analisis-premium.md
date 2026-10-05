# SPEC 13 — Correcciones del análisis Premium: tarjeta IA y gráficas

> **Status:** Verified
> **Depends on:** SPEC 06, SPEC 11, SPEC 12
> **Date:** 2026-10-05
> **Objective:** Quitar el banner de venta de la tarjeta de Análisis IA cuando el usuario es Premium y hacer que las barras de "Evolución por categoría" y "Promedio por periodo" de `/dashboard/analytics` se rendericen correctamente.

## Por qué existe esta spec

- `components/dashboard/ai-analysis-card.tsx:117-132` pinta incondicionalmente el bloque "Premium: análisis más profundos, patrones avanzados, predicciones" con un botón **Upgrade**, sin conocer el plan. Un usuario PREMIUM lo ve tras guardar una medición. El mockup premium (`references/dashboard/02-new-reading/premium/index.html`) dice explícitamente "Footer con Barra de Precisión (Sin banners de venta)" y muestra un badge corona **PREMIUM**.
- `components/dashboard/analytics-category-evolution.tsx:102-109` usa `<Bar dataKey={category.category}>` sobre puntos con forma `{ key, label, counts: { … } }`. Recharts busca el valor en la raíz del punto (no en `counts`), así que las 7 series quedan con **0 barras**: se ven ejes y leyenda, pero el área está vacía. Verificado en el DOM (7 grupos `recharts-bar` con 0 rectángulos) mientras la API devuelve 16 meses y 7 categorías.
- `components/dashboard/analytics-period-averages.tsx:116-129` usa un `BarChart` con 61 puntos semanales; cada barra mide ~0.45 px y la gráfica se ve como líneas/huecos.
- Ambos son bugs de presentación: `GET /bp-readings/analytics/category-distribution` y el DAL (`lib/readings/analytics.dal.ts`) entregan datos correctos.

## Alcance

**In:**

- `components/dashboard/ai-analysis-card.tsx`: nuevo prop `isPremium`; en Premium, badge "PREMIUM" (icono corona) en el encabezado y sin bloque de venta; en Free, el comportamiento actual intacto.
- `components/dashboard/new-reading-form.tsx`: recibe `isPremium` y lo reenvía a `AiAnalysisCard`.
- `app/(dashboard)/dashboard/new-reading/page.tsx`: resuelve la sesión con `verifySession()` y pasa `user.plan === "PREMIUM"`.
- `components/dashboard/analytics-category-evolution.tsx`: aplanar `counts` en los datos del `BarChart` para que las barras rendericen.
- `components/dashboard/analytics-period-averages.tsx`: cambiar `BarChart`/`Bar` por `LineChart`/`Line` (mismo estilo que `ReadingsTrendChart`).
- Repaso de accesibilidad (SPEC 06) y convenciones (SPEC 11).

**Out of scope (para specs futuras):**

- Cualquier cambio en `nest-tensi-api` (`src/**` y `prisma/**`): el `insight` y la cuota siguen iguales para ambos planes.
- Análisis IA más profundo/diferenciado para Premium.
- Dashboard Free, Reportes PDF, seed Premium y paginación del Historial.
- Limitar meses o periodos en las gráficas de Análisis.
- Tests automatizados (el repo no tiene runner).

## Modelo de datos

No hay estructuras de datos nuevas. Los endpoints y el DAL se consumen tal cual. La única transformación nueva es local al componente: aplanar `counts` para alimentar Recharts.

## Plan de implementación

Todo el trabajo es en `next-tensi-web`. Cada paso deja el sistema funcional.

1. **Tarjeta IA consciente del plan.** En `components/dashboard/ai-analysis-card.tsx` añadir `isPremium: boolean` a `AiAnalysisCardProps`; renderizar un badge "PREMIUM" con `Crown` de `lucide-react` junto al título y ocultar el bloque de venta y el CTA "Mejorar a Premium" del estado de error cuando `isPremium`. Verificación: con `isPremium` en `true`/`false` el pie de la tarjeta cambia; `pnpm lint` y `tsc`.
2. **Pasar el plan desde el servidor.** En `app/(dashboard)/dashboard/new-reading/page.tsx` hacer el componente `async`, llamar `verifySession()` (`redirect("/login")` si no hay usuario) y renderizar `<NewReadingForm isPremium={user.plan === "PREMIUM"} />`; en `components/dashboard/new-reading-form.tsx` recibir `isPremium` y reenviarlo a `AiAnalysisCard`. Verificación: Free ve banner + Upgrade; Premium ve badge y sin banner.
3. **Barras de Evolución por categoría.** En `analytics-category-evolution.tsx` construir `chartData = series.points.map(({ label, counts }) => ({ label, ...counts }))` y usar `chartData` en `<BarChart data={chartData}>` con `dataKey={category.category}`; la tabla `sr-only` sigue leyendo `series.points[].counts`. Verificación: 7 series con barras visibles en 16 meses y tabla con los mismos conteos.
4. **Promedio por periodo a líneas.** En `analytics-period-averages.tsx` sustituir `BarChart`/`Bar` por `LineChart`/`Line` (`type="monotone"`, `strokeWidth={2}`, sistólica continua `#fb7185`, diastólica discontinua `#38bdf8`, `dot` solo si `points.length <= 30` y `activeDot`, `isAnimationActive={false}`), conservando `domain`, tooltip, leyenda, `figcaption` y tabla `sr-only`. Verificación: semanal (61 puntos), mensual y anual pintan líneas legibles.
5. **Cierre.** Repasar a11y (`figure`/`role="img"`/`aria-label`, texto alternativo y no depender solo del color), responsive 375/1440 sin scroll horizontal ni errores de consola, y convenciones (sin `<a>`, props `Readonly<>`, clases canónicas, lógica fuera de componentes); `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build`; Playwright con `admin@tensi.com` (PREMIUM) y un usuario FREE.

## Criterios de aceptación

- [x] Como PREMIUM, tras guardar una medición la tarjeta de Análisis IA no muestra el texto "Premium: análisis más profundos…" ni el botón Upgrade.
- [x] Como PREMIUM, la tarjeta muestra un badge "PREMIUM" con icono corona.
- [x] Como FREE, la tarjeta conserva el banner, el botón Upgrade y el CTA "Mejorar a Premium" en el error de cuota.
- [x] `AiAnalysisCard` recibe `isPremium` desde `verifySession()` sin llamadas de red nuevas más allá del `check-token` memoizado por `cache()`.
- [x] `/dashboard/analytics` (PREMIUM) muestra "Evolución por categoría" con barras visibles para los 16 meses y 7 categorías, sin el mensaje "Todavía no hay meses…".
- [x] La tabla `sr-only` de "Evolución por categoría" muestra los mismos conteos que las barras.
- [x] "Promedio por periodo" se dibuja con líneas (continua sistólica / discontinua diastólica) y es legible en Semanal (61 puntos), Mensual y Anual.
- [x] Ninguna gráfica depende solo del color (línea discontinua, leyenda y tablas textuales).
- [x] `/dashboard/new-reading` y `/dashboard/analytics` son usables a 375 px y 1440 px sin scroll horizontal y sin errores de consola.
- [x] `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build` pasan.
- [x] `git -C ../nest-tensi-api status --short` limpio (el back no se toca).

## Decisiones

- **Sí:** badge PREMIUM sin banner de venta para Premium, como el mockup premium.
- **Sí:** solo presentación; el mismo `insight` para ambos planes (el análisis profundo diferenciado iría en su propia spec).
- **Sí:** aplanar `counts` localmente en el componente en vez de usar `dataKey="counts.x"`; no depende del soporte de rutas anidadas de Recharts.
- **Sí:** líneas para "Promedio por periodo" (61 puntos semanales hacen las barras ilegibles), reutilizando el estilo de `ReadingsTrendChart`.
- **Sí:** `dot` condicional (sin puntos cuando hay más de 30 periodos) para no saturar la gráfica.
- **No:** limitar meses/periodos; la Evolución muestra todo el histórico.
- **No:** cambios en la API, en el seed ni en el dashboard Free.
- **No:** tests automatizados (no hay runner en el repo).

## Riesgos

| Riesgo                                                             | Mitigación                                                                                                   |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Duplicar el guard de sesión en la página `new-reading`             | `verifySession()` ya está memoizado con `cache()`; comparte la llamada del layout, sin coste extra           |
| Cambiar el tipo de gráfico altera el aspecto de Análisis           | Solo cambia "Promedio por periodo"; se mantienen colores, leyenda y alternativas textuales                   |
| Una línea con 61 puntos puede verse densa                          | `dot={false}` y `activeDot` para inspección; el tooltip conserva los valores                                 |
| Barras apiladas de Evolución con 16 meses × 7 categorías muy finas | Con 16 puntos el ancho por banda es suficiente; se valida a 375/1440 y se comprueba que haya barras visibles |
| El badge PREMIUM rompe el layout del encabezado en móvil           | Badge corto con `shrink-0` y `flex-wrap`; se verifica a 375 px                                               |

## Qué **no** entra en esta spec

- Cambios en la API o en el seed.
- Análisis IA más profundo para Premium.
- Dashboard Free, Reportes PDF, paginación del Historial.
- Limitar meses/periodos de las gráficas.
- Tests automatizados.

Cada uno, si se implementa, va en su propia spec.
