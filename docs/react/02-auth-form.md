# Revisión de buenas prácticas React 19 / Next.js 16 — Formularios de auth

- Fecha: 2026-10-01
- Objetivo: `components/auth/*` y `components/form/*` (12 archivos)
  - `components/auth/login-form.tsx`
  - `components/auth/register-form.tsx`
  - `components/auth/verify-account-form.tsx`
  - `components/auth/forgot-password-form.tsx`
  - `components/auth/reset-password-form.tsx`
  - `components/auth/auth-header.tsx`
  - `components/auth/form-error.tsx`
  - `components/auth/submit-button.tsx`
  - `components/auth/logout-button.tsx`
  - `components/form/form-field.tsx`
  - `components/form/password-field.tsx`
  - `components/form/code-field.tsx`
- Referencias: React 19.2.8 + Next.js 16.3.7 (App Router) + Context7
  - Next.js docs locales: `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`, `node_modules/next/dist/docs/01-app/02-guides/forms.md`, `node_modules/next/dist/docs/01-app/03-api-reference/02-components/form.md`
  - Context7 `/vercel/next.js/v16.2.9` → `01-directives/use-client.mdx`, `01-getting-started/05-server-and-client-components.mdx`
  - Context7 `/react/react/v19.2.8` → `useId`, controlled/uncontrolled inputs, ref-as-prop/`forwardRef`, `useActionState`/`useFormStatus`

## Resumen ejecutivo

El código auditado está **mayormente alineado** con React 19 y Next.js 16. No se encontró
ningún incumplimiento de severidad alta: no hay reglas de hooks rotas (no hay `useEffect`,
`useMemo` ni `useCallback` en estos archivos), no hay `forwardRef`/`defaultProps`/`React.FC`/
refs string/`dangerouslySetInnerHTML`/`any`, no se muta estado ni props, y las listas tienen
`key` (la del `code-field` es de índice pero está justificada, ver abajo).

- **Incumplimientos reales: 1** (bajo) → `submit-button.tsx`: `'use client'` redundante. **Corregido.**
- **Mejoras recomendadas: 6** (3 medias + 3 bajas), ninguna aplicada porque alteran comportamiento
  o son decisiones de producto (ver detalle y motivo por hallazgo).
- **Estado global: corregido** (el único incumplimiento detectado) y verificado con
  `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build` (todo OK).

Frontera Server/Client: las 5 páginas de auth son Server Components (`app/(auth)/*/page.tsx`) y
solo pasan props serializables (strings `email`) a los Client Components
(`verify-account/page.tsx:24`, `reset-password/page.tsx:26`), conforme a la doc de Next
("props passed to Client Components need to be serializable", Context7 `/vercel/next.js/v16.2.9`).
`auth-header.tsx` y `form-error.tsx` **no** llevan `'use client'` y es correcto: son presentacionales
y no usan hooks ni APIs del navegador.

### Conteo por severidad

| Severidad | N.º | Aplicados |
| --- | --- | --- |
| Alta | 0 | 0 |
| Media | 3 | 0 |
| Baja | 4 | 1 |
| **Total** | **7** | **1** |

## Hallazgos por archivo

| Archivo | Severidad | Ubicación | Evidencia (código) | Problema | Recomendación | ¿Aplicado? |
| --- | --- | --- | --- | --- | --- | --- |
| `components/auth/submit-button.tsx` | Baja (incumplimiento) | línea 1 | `'use client'` en un componente sin hooks, sin handlers y sin APIs del navegador (`disabled`/`aria-busy` derivados de props) | Directiva redundante: Next 16 solo la requiere en ficheros cuyos componentes se renderizan directamente dentro de Server Components. `SubmitButton` solo se importa desde Client Components (`login/register/verify/forgot/reset-form.tsx`); el resto del grafo ya es cliente | Eliminar `'use client'`; el componente sigue siendo cliente por el grafo de imports y así se evita declarar una entrada de cliente innecesaria | **Sí** |
| `components/auth/auth-header.tsx` | Media | líneas 32-46 | `<button type="button" aria-label="Cambiar tema" title="Cambiar tema">` sin `onClick` ni handler | Control inerte: el botón no hace nada. Es un placeholder del mockup, pero para lectores de pantalla es un botón operable que no responde | Implementar el toggle de tema (cliente) o, mientras tanto, marcarlo `disabled`/`aria-disabled` con texto "Próximamente" como en `OAuthButton`. **Decisión de producto** | No (cambia semántica/UI) |
| `components/auth/submit-button.tsx` | Media | líneas 13-17 | `disabled={isSubmitting}` | Al deshabilitar el botón que tiene el foco, el navegador puede sacarlo del tab order y perderse el foco; además un botón deshabilitado no anuncia el cambio de estado por sí mismo | Patrón accesible: `aria-disabled={isSubmitting}` + guarda en el submit, o mover el foco a un `role="status"` con el texto "Enviando…". Se mantiene `aria-busy` que ya está | No (cambia interacción) |
| `components/form/code-field.tsx` | Media | línea 37 (`commit`), 36 (`shouldValidate: true`); schema en `lib/auth/schemas.ts:21-23` | `setValue(name, next, { shouldValidate: true })` en cada pulsación; `code = z.string().regex(/^\d{6}$/, 'El código debe tener exactamente 6 dígitos')` | Al escribir el primer dígito ya se valida y aparece/anuncia (`role="alert"`, línea 128) el error de "exactamente 6 dígitos": error prematuro y ruido para lectores de pantalla | Validar solo al completar: `shouldValidate: next.length === LENGTH`. Nota: el campo no está `register`-ado, así que `shouldValidate` es lo único que refresca el error; hay que mantener revalidación al llegar a 6 | No (cambia comportamiento de validación) |
| `components/auth/login-form.tsx` | Baja | líneas 57-63 | `<button type="button" onClick={goToForgotPassword}>¿Olvidaste tu contraseña?</button>` | Navegación implementada con botón + `router.push` en lugar de un enlace; pierde semántica de link, prefetch y abrir en pestaña nueva (el otro enlace del mismo bloque sí usa `<Link>`, línea 67) | Usar `<Link href="/forgot-password">` con el mismo estilo. Requiere dejar de usar `goToForgotPassword` del hook (`lib/auth/hooks/use-login-form.ts`, fuera de esta auditoría) | No (fuera de alcance / toca hook) |
| `components/form/code-field.tsx` | Baja | línea 28 | `const value = String(watch(name) ?? '')` | `watch(name)` suscribe el componente a cambios del formulario; `useWatch` aísla el re-render a este componente (RHF 7.89; `useWatch` cae al `control` del `FormProvider`, verificado en `node_modules/react-hook-form/dist/index.cjs.js`) | Cambiar a `useWatch({ name })` para aislar re-renders | No (optimización; sin bug) |
| `components/form/code-field.tsx` | Baja | líneas 42-53 y 104-124 | `onChange` + navegación de foco; inputs sin `disabled` durante submit ni `autoFocus` | Los 6 inputs siguen editables mientras `isSubmitting` y no se lleva el foco al primer dígito al montar | Aceptar `disabled` (API nueva) y/o `autoFocus` en el primer dígito; pasar `disabled={isSubmitting}` desde las pantallas | No (requiere cambiar API pública del componente) |
| `components/form/password-field.tsx` | Baja | líneas 53-59 | Toggle con `type="button"`, `aria-pressed`, `aria-label` correctos, pero sin `aria-controls` | Asociación entre el botón y el input no explícita. Es opcional (`aria-pressed` + cambio de `aria-label` ya transmiten el estado) y el soporte de `aria-controls` es irregular entre lectores | Añadir `aria-controls={id}` si se quiere reforzar la asociación | No (mejora opcional, valor dudoso) |

## Archivos sin hallazgos (revisados y conforme)

- `components/auth/register-form.tsx` — `'use client'` necesario; `noValidate`; `autoComplete`
  correctos (`username`, `email`, `new-password`); submit deshabilitado vía `SubmitButton`. Sin problemas.
- `components/auth/verify-account-form.tsx` — `autoComplete="email"`; reenvío con `type="button"`,
  `disabled={isResending}` y `aria-busy`; aviso con `role="status"`. Sin problemas.
- `components/auth/forgot-password-form.tsx` — formulario de email con label y `autoComplete`. Sin problemas.
- `components/auth/reset-password-form.tsx` — email + código + `new-password`; mismo patrón. Sin problemas.
- `components/auth/form-error.tsx` — sin `'use client'` (correcto), `role="alert"`, retorno `null` si no hay mensaje. Sin problemas.
- `components/auth/logout-button.tsx` — `'use client'` necesario (`useAuth`); `type="button"`,
  `disabled`, `aria-busy`, error con `role="alert"`. Sin problemas.
- `components/form/form-field.tsx` — `'use client'` necesario; `useId()` + `htmlFor`/`id` (Context7
  React 19: `useId` es la forma recomendada de generar ids estables para `label`/`input`),
  `aria-invalid` + `aria-describedby` al error. Sin problemas.
- `components/auth/login-form.tsx` / `register-form.tsx` (resto) — placeholders OAuth como
  `<button disabled>` con texto `sr-only` "(Próximamente)"; correcto.

## Puntos revisados que NO son hallazgos (falsos positivos descartados)

- **`key={index}` en `code-field.tsx:107`**: el índice es estable porque hay siempre 6 posiciones
  fijas que nunca se reordenan; el propio código lo documenta en el comentario de la línea 106.
  No se considera incumplimiento (`key` no estable aplica solo cuando el orden puede cambiar).
- **Inputs controlados en `code-field.tsx`**: `value` + `onChange` + `setValue` es el patrón
  correcto para un input segmentado; los demás campos son uncontrolled vía `register`, también correcto.
- **`as never` en `code-field.tsx:36`**: es un escape de tipos necesario por los genéricos de RHF,
  no un `any` que rompa `strict`.
- **Sin `useMemo`/`useCallback`/`memo`**: correcto, no hay coste medible y React Compiler está
  desactivado; memoizar aquí sería prematuro.
- **Sin `forwardRef`**: correcto en React 19, donde `ref` ya es una prop normal (Context7
  `/react/react/v19.2.8`: el reconciler ya no lo separa de `props`).
- **`useActionState`/`useFormStatus` no usados**: correcto para este repo, que usa
  react-hook-form + TanStack Query; no se propone reemplazarlos.

## Cambios aplicados

1. `components/auth/submit-button.tsx` — eliminada la directiva `'use client'` (era la primera
   línea). El componente no usa hooks, handlers ni APIs del navegador y solo se consume desde
   Client Components, así que la frontera sigue siendo la misma (cambios posteriormente validados
   con `pnpm build`). Cita: Next 16, `'use client'` solo es necesario en ficheros cuyos componentes
   se renderizan directamente dentro de Server Components (Context7 `/vercel/next.js/v16.2.9`,
   `03-api-reference/01-directives/use-client.mdx`; doc local `05-server-and-client-components.md`).

Ningún otro hallazgo se aplicó: o bien alteran comportamiento (validación/foco/disabled/navegación),
o requieren cambiar la API pública de un componente (`disabled`/`autoFocus`), o son decisiones de
producto (botón de tema en `auth-header.tsx`).

## Verificación

- `pnpm lint` → OK (sin warnings).
- `pnpm exec tsc --noEmit` → OK (exit 0).
- `pnpm build` → OK (Next.js 16.3.7/Turbopack; 10 rutas generadas, sin errores de frontera RSC).

## No verificado / no verificable

- **Comportamiento real con lector de pantalla** (anuncio de "Enviando…", pérdida de foco al
  deshabilitar el botón, anuncio prematuro del error del código): no verificado en navegador;
  se marca como recomendación basada en especificación ARIA, no como bug confirmado.
- **`aria-controls` en el toggle de contraseña**: no aplicado; su utilidad depende del lector de
  pantalla, por lo que no se puede confirmar una mejora medible.
- **`watch` vs `useWatch`**: la equivalencia funcional se comprobó leyendo el bundle instalado
  (`react-hook-form@7.89.0`, `dist/index.cjs.js`), pero no se midió el impacto en re-renders.
