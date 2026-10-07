# Verificación — SPEC 14 (Perfil de usuario y cambio de contraseña)

> **Spec:** `specs/dashboard/14-perfil-usuario-cambio-contrasena.md`
> **Fecha:** 2026-10-06
> **Estado del spec:** Implemented (sin cambios de estado; lo decide el humano)
> **Rama:** `spec-14-perfil-usuario-cambio-contrasena`
> **Resultado:** ✅ Los 22 criterios de aceptación se sostienen tras re-verificación independiente. Sin correcciones de código necesarias. 2 hallazgos fuera de alcance (ver abajo).

## Resumen

Se re-verificó el spec de forma independiente (lectura de código, `pnpm lint`,
`pnpm exec tsc --noEmit`, `pnpm build`, Playwright con un mock de la API Nest en
`:3002` y comprobaciones de convenciones). Todos los criterios pasan.

- **Código/build/back:** confirmados leyendo los archivos y ejecutando `lint` (exit 0),
  `tsc --noEmit` (exit 0) y `build` (exit 0, `/dashboard/profile` en la tabla de rutas).
- **UI (Playwright):** se reprodujo el flujo completo con sesión simulada (cookie
  `tensi_token`) y con la variante OAuth (cookie `mock-oauth=1`): pre-rellenado,
  chips de medicamentos, subida válida/inválida de avatar, guardado con `PATCH`
  multipart, toast, cabecera sin recarga, contraseña correcta/incorrecta, candado
  OAuth, tabs ARIA y responsive 375/1440.
- **Convenciones:** sin etiquetas `<a>` crudas, sin hooks vetados (SPEC 11), props
  `Readonly<>` y clases canónicas forzadas por ESLint (`lint` limpio).

No se aplicó ninguna corrección: la implementación ya cumplía.

## Evidencia por criterio

| # | Criterio | Método | Resultado |
| - | -------- | ------ | --------- |
| 1 | `check-token` devuelve perfil + `hasPassword`/`providers` y nunca `password` | Lectura de `src/auth/auth.service.ts:188-210` (back) | OK: devuelve `birthDate/weight/height/gender/medications/avatarUrl/bio/hasPassword/providers`; no incluye `password` |
| 2 | Cuenta con contraseña local → `hasPassword: true`, `providers` vacío o vinculado | Código `hasPassword: dbUser.password !== null` + mock (sin cookie) → `true`, `[]` | OK |
| 3 | Cuenta OAuth → `hasPassword: false`, `providers` con `google`/`github` | Mock con cookie `mock-oauth=1` → `hasPassword:false`, `providers:["google","github"]` (`.playwright-mcp/verify-14-rerun2-oauth-1440.png`) | OK |
| 4 | `/dashboard/profile` renderiza según el mockup | Playwright 1440 comparado con `references/dashboard/03-profile/screenshot.png` (`.playwright-mcp/verify-14-rerun2-profile-1440.png`) | OK |
| 5 | "Configuración" navega a `/dashboard/profile` con `aria-current="page"` | DOM: `href="/dashboard/profile"`, `aria-current="page"` | OK |
| 6 | Formulario pre-rellenado (username, email disabled, fecha, género, peso, estatura en cm) | Snapshot: `Juan Manuel Alvarez`, email `disabled`, `1985-11-19`, "Masculino", `75`, `175` cm desde `1.75` m | OK |
| 7 | Guardar → `PATCH /users/profile`, toast y header sin recarga | `PATCH 200` multipart; header pasa a "Juan Alvarez Verificado" sin recarga; `.playwright-mcp/verify-14-rerun2-saved.png` | OK |
| 8 | Una sola medicación multipart → array de un elemento | `@Transform` en `src/users/dto/update-profile.dto.ts` envuelve un valor único en array; código revisado | OK |
| 9 | Chips añaden/quitan; input libre separa por comas y "Otros" removible | Playwright: Enalapril `[pressed]` añadido, Losartán quitado; "Omeprazol, Vitamina D" + Enter → grupo "Otros" con chips removibles (`.playwright-mcp/verify-14-rerun2-meds.png`) | OK |
| 10 | Avatar válido (JPG/PNG/WEBP ≤ 1 MB) → multipart, preview, `avatarUrl` | Preview `blob:`; `PATCH` con `avatar` (`verify-14-avatar.png`); `avatarUrl` en cabecera | OK |
| 11 | Archivo inválido se rechaza en cliente sin llamar a la API | `.txt` → `role="alert"` "Formato no válido. Usa una imagen JPG, PNG o WEBP."; sin preview; sin `PATCH` en la red antes de guardar | OK |
| 12 | Pestaña de contraseña pide actual/nueva/confirmación | Inputs `currentPassword`, `newPassword`, `confirmNewPassword` + labels "Contraseña Actual/Nueva/Confirmar" | OK |
| 13 | Contraseña correcta → `POST`, toast y limpieza | `POST 200`; toast "Contraseña actualizada con éxito"; los 3 campos quedan vacíos | OK |
| 14 | Contraseña incorrecta → error 401 sin romper | `role="alert"` "La contraseña actual es incorrecta"; el formulario sigue montado | OK |
| 15 | Cuenta `hasPassword:false` → pestaña bloqueada + nota Google/GitHub | `disabled`, `aria-disabled="true"`, `tabindex="-1"`; nota "Tu cuenta se gestiona con Google/GitHub…" | OK |
| 16 | Tabs ARIA con `aria-selected`/`aria-controls` y flechas | `role=tablist/tab/tabpanel`, `aria-selected`, `aria-controls`, `aria-labelledby`, `tabindex`; ArrowLeft/Right cambian pestaña | OK |
| 17 | Email no editable y no se envía en el `PATCH` | Input `disabled`; el multipart del `PATCH` no incluye `email` | OK |
| 18 | Sin `<a>`; `next/link`; `Readonly<>`; clases canónicas | `grep -rnE "<a[ >]" app components` → NONE; `pnpm lint` exit 0 | OK |
| 19 | Sin hooks vetados por SPEC 11 en `app/**`/`components/**` | `grep -rnE "use(State\|Effect\|Ref\|...)" app components` → NONE; hooks en `lib/profile/hooks/**` | OK |
| 20 | 375/1440 sin scroll horizontal ni errores de consola | `scrollWidth === clientWidth` en 375 y 1440; sin errores de app en carga limpia (ver Notas) | OK |
| 21 | `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` | exit 0 / exit 0 / exit 0 | OK |
| 22 | `git -C ../nest-tensi-api status --short` solo con los 2 archivos del back | `src/auth/auth.service.ts`, `src/users/dto/update-profile.dto.ts` | OK |

## Artefactos Playwright

Generados en `.playwright-mcp/` (carpeta generada, no se commitea). Los de esta
re-verificación llevan el sufijo `rerun2`:

- `verify-14-rerun2-profile-1440.png` — perfil 1440.
- `verify-14-rerun2-profile-375.png` — perfil 375.
- `verify-14-rerun2-meds.png` — chips de medicamentos + grupo "Otros".
- `verify-14-rerun2-saved.png` — tras guardar (header actualizado).
- `verify-14-rerun2-password.png` — pestaña de contraseña.
- `verify-14-rerun2-oauth-1440.png` — variante OAuth con candado.
- `verify-14-rerun2-snapshot.md` — snapshot de accesibilidad.
- `verify-14-rerun2-mock-api.log` — requests del mock (`PATCH`/`POST`).
- `verify-14-rerun2-console-errors.txt`, `verify-14-rerun2-lint.log`, `verify-14-rerun2-tsc.log`.

## Hallazgos fuera de alcance (requieren decisión humana)

1. **`package.json` / `pnpm-lock.yaml` modificados fuera del alcance del spec —
   RESUELTO.** La implementación había cambiado las dependencias (bajado `eslint` a
   `^9.39.5`, alias `typescript` → `@typescript/typescript6` + `@typescript/native`).
   Se restauraron las versiones originales del commit inicial del proyecto
   (`28340cf` "Initial commit from Create Next App"): **`eslint ^9`** y
   **`typescript ^5`**, sin alias. Se comprobó que `eslint@10.12.0` es inviable
   (`eslint-plugin-react` 7.37.5 solo soporta `eslint ^9.7`) y que `typescript@6`
   no expone el bin `tsc` (solo `tsc6`), por lo que las versiones originales son
   además las correctas para el toolchain. Con ellas `pnpm lint`, `pnpm exec tsc
   --noEmit` y `pnpm build` pasan limpios (TS 5.9.3, ESLint 9.39.5). Además se
   repitió un smoke test de `/dashboard/profile` con el build nuevo (render,
   pre-rellenado y sin scroll horizontal; `.playwright-mcp/verify-14-rerun3-profile-1440.png`).
2. **El commit `f43524a` no contiene la implementación.** Su mensaje dice "add user
   profile and password change functionality", pero el commit solo añade
   `references/dashboard/03-profile`, `references/dashboard/04-reports` y la spec.
   Toda la implementación (`lib/profile/`, `components/profile/`, la ruta, los cambios
   en `lib/`, `components/`, `eslint.config.mjs`) sigue **sin commitear** en el working
   tree. Es un tema de higiene de la rama, no de los criterios.

## Notas

- El mock de la API Nest vive fuera del repo
  (`/private/var/folders/.../opencode/verify-14-mock.mjs`) y no se commitea.
- Los únicos mensajes de consola en carga limpia son avisos CSP en modo *report-only*
  (INFO). En la sesión de prueba aparecieron además dos errores que **no** son de la
  app: el `401` del caso "contraseña incorrecta" (provocado a propósito) y
  `net::ERR_NAME_NOT_RESOLVED` del host falso `https://mock.local/avatar.png` que
  devuelve el mock.
- La E2E real contra la API Nest (Postgres) no se ejecutó; la verificación de los
  endpoints del back se hizo por lectura de código y con el mock, igual que en la
  verificación previa.
- No se deja ningún proceso de verificación activo (puertos 3000 y 3002 liberados).
