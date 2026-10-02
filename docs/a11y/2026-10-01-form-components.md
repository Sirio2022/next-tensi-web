# Informe de accesibilidad — Componentes de formulario

**Fecha:** 2026-10-01
**Alcance:** `components/form/form-field.tsx`, `components/form/password-field.tsx`, `components/form/code-field.tsx`
**Estándar:** WCAG 2.2 nivel AA
**Herramientas:** Playwright + axe-core 4.10.2 (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`), verificación manual de teclado y árbol de accesibilidad.

## Resultado

| Métrica                                           | Antes | Después |
| ------------------------------------------------- | ----- | ------- |
| Violaciones axe (estado inicial)                  | 0     | 0       |
| Violaciones axe (con errores visibles)            | 0     | 0       |
| Incumplimientos AA detectados por revisión manual | 3     | 0       |

axe no reporta automáticamente los tres hallazgos (contraste no textual de bordes, reflow a 320px y contraste de placeholder dependen del fondo compuesto y del viewport), por eso se detectaron con revisión manual + capturas.

## Incumplimientos corregidos

| Criterio                    | Severidad | Ubicación                              | Problema                                                                                                          | Corrección                                                                                                                 |
| --------------------------- | --------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 1.4.11 Contraste no textual | Serio     | los 3 componentes                      | Borde por defecto `border-slate-800` ≈ 1.36:1 sobre el fondo compuesto → por debajo de 3:1                        | `border-slate-500` → **4.23:1** (el `slate-600` intermedio daba 2.63:1 y **no** alcanzaba)                                 |
| 1.4.10 Reflow               | Serio     | `code-field.tsx`                       | A 320px la fila OTP desbordaba (scrollWidth ≈ 1351px). Causa raíz: el `<fieldset>` tenía `min-width: min-content` | `className="min-w-0 w-full"` en el `<fieldset>` + cajas `min-w-0 flex-1 basis-0` → a 320px `scrollWidth = 320`, sin scroll |
| 1.4.3 Contraste (texto)     | Moderado  | `form-field.tsx`, `password-field.tsx` | `placeholder-slate-500` ≈ 4.18:1 → por debajo de 4.5:1                                                            | `placeholder-slate-400` (7.57:1)                                                                                           |

> Nota: la primera pasada usó `border-slate-600` y no resolvió 1.4.11 (2.63:1). La re-verificación en navegador lo detectó y se corrigió a `border-slate-500`. El reflow tampoco se resolvió moviendo solo las cajas: la causa era el `min-width: min-content` del `<fieldset>`.

## Consistencia (aplicada)

- Se eliminó `aria-errormessage` en `form-field.tsx` y `password-field.tsx`. Apuntaba al mismo nodo que `aria-describedby`, lo que podía provocar doble anuncio en lectores de pantalla. Ahora los tres componentes usan solo `aria-invalid` + `aria-describedby` + `role="alert"`.

## Verificado correcto

- 2.5.8 Target size: toggle de contraseña 44×46, cajas OTP 44×48.
- 2.4.7 Foco visible: borde + anillo `blue-500` con foco por teclado.
- 3.3.1 / 3.3.3: errores con `role="alert"` y texto asociado.
- 1.3.1: labels nativos, `fieldset`/`legend` en el OTP.
- 1.3.5: `autocomplete` correcto (`email`, `one-time-code`, etc.).
- 4.1.2: roles nativos y nombres accesibles.
- Teclado en OTP: auto-avance al escribir, Backspace, flechas, pegado de 6 dígitos.
- Toggle de contraseña: cambio `type` password↔text, `aria-pressed` y `aria-label` sincronizados.

## Pendiente (fuera del alcance de estos componentes)

- `app/layout.tsx` usa `lang="en"` (3.1.1) y `metadata.title = "Create Next App"` (2.4.2). Se corrige en el paso de tokens de diseño/pantallas.
- Valorar añadir `required`/`aria-required` a los campos cuando zod lo exige (mejora de 3.3.2, no incumplimiento).

## Artefactos

Capturas y trazas en `.playwright-mcp/` (`demo-01-default.png` … `demo-05-zoom-200.png`). La página de demo temporal (`app/a11y-form-demo/`) fue eliminada tras la verificación.
