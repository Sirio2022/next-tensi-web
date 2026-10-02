# SPEC 05 — Endurecimiento de auth, formularios y lib

> **Status:** Aprobado
> **Depends on:** SPEC 01
> **Date:** 2026-10-02
> **Objective:** Corregir los hallazgos funcionales de auth, formularios y `lib/` (validación, foco, navegación, timeout HTTP y acoplamiento de sesión) manteniendo la compatibilidad de la API pública.

## Por qué existe esta spec

- `docs/react/02-auth-form.md` dejó pendientes: validación prematura en `code-field`, pérdida de foco en `submit-button`, navegación con botón en `login-form` y el botón de tema inerte.
- `docs/react/03-lib-hooks.md` dejó pendientes: timeout/type guards en `fetch-client`, invalidación no-op en `use-auth` y la reexportación de `ApiError`.
- `docs/react/05-dashboard-shell.md` #2: el sidebar importa `useAuth()` completo solo para `logout`.
- `docs/react/01-landing-site.md` #2: `auth-modals` re-renderiza todo el subárbol al abrir un modal (`mode` dentro del `value`).

## Alcance

**In:**

- `components/form/code-field.tsx`: validar solo al completar los 6 dígitos (`shouldValidate: next.length === 6`), mantener la revalidación al llegar a 6; pasar de `watch` a `useWatch`; aceptar `disabled` durante el submit y `autoFocus` en el primer dígito (API aditiva).
- `components/auth/submit-button.tsx`: patrón `aria-disabled` + guarda en el submit para no perder el foco; conservar `aria-busy`.
- `components/auth/login-form.tsx`: "¿Olvidaste tu contraseña?" como `<Link href="/forgot-password">`; `goToForgotPassword` queda sin uso o se retira del hook.
- `components/site/auth-modals.tsx`: sacar `mode` del `value` del contexto (separar acciones estables de estado) y migrar el diálogo al elemento nativo `<dialog>` (elimina el warning `jsx-a11y/prefer-tag-over-role` y mejora el foco).
- `components/auth/auth-header.tsx`: botón "Cambiar tema" `disabled` + `aria-disabled` con texto "Próximamente".
- `lib/auth/hooks/use-auth.ts`: eliminar la invalidación no-op de `['auth', 'session']`.
- `lib/auth/hooks/use-logout.ts` (nuevo): `useLogout()` que expone solo la mutación de logout; `components/dashboard/dashboard-sidebar.tsx` lo consume y deja de usar `useAuth()` completo.
- `lib/http/fetch-client.ts`: `timeout?: number` opcional combinado con `AbortSignal.timeout()`/`AbortSignal.any()` (aditivo) y type guards en las respuestas para no propagar cuerpos no-JSON como `T`.
- `lib/auth/types.ts`: dejar de reexportar el valor `ApiError`; actualizar los imports a `@/lib/http/types`.

**Out of scope (para specs futuras):**

- Rediseño del patrón de sesión con TanStack Query.
- Server Actions / `useActionState` (el repo usa RHF + zod + TanStack Query deliberadamente).
- Nuevos endpoints de la API Nest.
- Elementos visuales ya cubiertos por SPEC 04/06/07.

## Modelo de datos

No hay cambios de base de datos.

- `useLogout()` devuelve `{ logout }` con la mutación `useMutation` de TanStack Query ya existente.
- `HttpRequestOptions` añade `timeout?: number` (opcional, sin valor por defecto obligatorio para no cambiar comportamiento existente).

## Plan de implementación

1. `lib/http/fetch-client.ts`: añadir `timeout` y `AbortSignal.any`. Verificación: una request a un endpoint lento aborta al superar el timeout.
2. `lib/http/fetch-client.ts`: type guards de `ApiErrorBody` y validación mínima en éxito. Verificación: un 2xx con HTML no se propaga como `T`.
3. `lib/auth/types.ts` + imports: quitar la reexportación de `ApiError`. Verificación: `tsc` y `lint`.
4. `lib/auth/hooks/use-auth.ts`: eliminar la invalidación no-op. Verificación: login/logout siguen funcionando.
5. Crear `lib/auth/hooks/use-logout.ts` y consumirlo en `dashboard-sidebar.tsx`. Verificación: "Cerrar Sesión" navega a `/login`.
6. `components/form/code-field.tsx`: validación a 6 dígitos + `useWatch` + `disabled`/`autoFocus` opcionales. Verificación: con 1–5 dígitos no hay error; a los 6 se valida.
7. `components/auth/submit-button.tsx`: `aria-disabled` + guarda. Verificación: el foco no se pierde durante el envío.
8. `components/auth/login-form.tsx`: `<Link>` a `/forgot-password`. Verificación: teclado y "abrir en pestaña nueva".
9. `components/site/auth-modals.tsx`: sacar `mode` del `value` + migrar a `<dialog>` nativo. Verificación: abrir modal no re-renderiza hero/header; foco y Escape correctos.
10. `components/auth/auth-header.tsx`: deshabilitar "Cambiar tema" con "Próximamente".

## Criterios de aceptación

- [ ] Un 2xx con cuerpo no-JSON no se propaga como el tipo esperado `T`.
- [ ] Una request que supera el `timeout` se aborta (test manual con endpoint lento).
- [ ] `ApiError` se importa solo desde `@/lib/http/types` (sin reexport en `lib/auth/types.ts`).
- [ ] Login/logout siguen funcionando sin la invalidación `['auth','session']`.
- [ ] El sidebar usa `useLogout()` y no `useAuth()`.
- [ ] `code-field` no muestra error con 1–5 dígitos y sí a los 6.
- [ ] `submit-button` mantiene el foco del elemento activo durante el envío.
- [ ] "¿Olvidaste tu contraseña?" es un `<Link>` navegable con teclado.
- [ ] Abrir un modal no re-renderiza `Hero`, `SiteHeader` ni `Cta` (el `mode` no está en el `value`).
- [ ] El modal usa `<dialog>` y ya no dispara el warning `prefer-tag-over-role`.
- [ ] "Cambiar tema" está `disabled` y anuncia "Próximamente".
- [ ] API pública compatible: los consumidores actuales de los componentes y hooks siguen compilando.
- [ ] `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build` pasan.
- [ ] Playwright (con mock de la API Nest si hace falta): register → verify → login → logout sin errores de consola.

## Decisiones

- **Sí:** `useWatch` en `code-field` para aislar el re-render.
- **Sí:** `aria-disabled` + guarda en lugar de `disabled` puro en el submit.
- **Sí:** `<dialog>` nativo en `auth-modals` (elimina el warning y mejora el foco).
- **Sí:** `useLogout()` aditivo; `useAuth()` se conserva para el resto.
- **Sí:** botón de tema deshabilitado con "Próximamente" (no se implementa el tema claro).
- **Sí:** timeout opcional; sin valor por defecto para no cambiar comportamiento existente.
- **No:** reemplazar RHF + zod + TanStack Query por Server Actions.

## Riesgos

| Riesgo                                                             | Mitigación                                                                    |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Migrar a `<dialog>` cambia el comportamiento del foco/Escape       | Reusar la lógica actual de focus trap y probar Escape/backdrop con Playwright |
| El timeout por defecto podría romper llamadas legítimamente largas | Dejarlo opcional y configurable por request                                   |
| Quitar `goToForgotPassword` rompe otros consumidores               | Verificar consumidores con `grep` antes de retirarlo                          |
| Type guards estrictos rechazan respuestas válidas de la API        | Cubrir los casos reales (JSON y error) antes de endurecer                     |

## Qué **no** entra en esta spec

- Rediseño del patrón de sesión y Server Actions.
- Tema claro/oscuro (SPEC 04/06).
- Regla `next/link` (SPEC 07).
- Nuevos endpoints de Nest.

Cada uno, si se implementa, va en su propia spec.
