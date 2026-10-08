# SPEC 16 — Login con Google y GitHub (OAuth)

> **Status:** Borrador
> **Depends on:** SPEC 01, SPEC 09
> **Date:** 2026-10-08
> **Objective:** Habilitar el login/registro con Google y GitHub desde `/login`, con la API haciendo el OAuth, validando `state`, emitiendo la cookie httpOnly y redirigiendo al front.

## Por qué existe esta spec

- La API ya tiene las estrategias `google`/`github`, los guards y `AuthService.findOrCreateOAuthUser` (vincula por email o crea la cuenta), pero `googleAuthRedirect`/`githubAuthRedirect` devuelven **JSON** con el token en el body, lo que contradice el patrón de cookie httpOnly de SPEC 01.
- El front muestra los botones sociales deshabilitados con "Próximamente" (SPEC 01 los difirió; SPEC 02 y SPEC 14 también los dejaron fuera).
- Sin `state` validado, el callback acepta un `code` ajeno (login CSRF); se cierra aquí junto con el endurecimiento de SPEC 09.

## Alcance

**In:**

- API `nest-tensi-api`:
  - `GET /api/auth/google` y `GET /api/auth/github`: generan un `state` aleatorio, lo guardan en una cookie httpOnly de vida corta y lo pasan al proveedor.
  - `GET /api/auth/google/callback` y `GET /api/auth/github/callback`: validan el `state`, emiten la cookie `tensi_token` (mismas opciones que `login`) y redirigen al front; ya no devuelven JSON.
  - Éxito → `<primer origen de CORS_ORIGIN>/dashboard`; fallo (cancelado, `state` inválido, email ausente o error del proveedor) → `<primer origen de CORS_ORIGIN>/login?error=oauth`.
  - `findOrCreateOAuthUser` se mantiene: auto-vincula por email y crea la cuenta (`confirmed: true`) en el primer login.
- Web `next-tensi-web`:
  - `lib/auth/hooks/use-oauth.ts` (nuevo): `startOAuth(provider: OAuthProvider)` navega a `${NEXT_PUBLIC_API_URL}/auth/google|github`.
  - `components/auth/login-form.tsx`: botones de Google y GitHub habilitados que delegan en el hook (sin lógica en el componente).
  - `app/(auth)/login/page.tsx`: lee `?error=oauth` y muestra el aviso de fallo.
  - Se conservan los iconos y estilos del mockup `04-login`.
- Documentar en `.env.template` que `GOOGLE_CALLBACK_URL` y `GITHUB_CALLBACK_URL` deben coincidir con las apps registradas en Google Cloud Console y GitHub Developers.

**Out of scope (para specs futuras):**

- Botones sociales en `/register` (el mockup no los muestra).
- Vincular/desvincular proveedores desde Perfil (SPEC 14 solo dejó el candado de la contraseña).
- Popup + `postMessage`.
- Refresh token rotativo y "recordarme".
- 2FA por proveedor.

## Modelo de datos

No hay cambios en Prisma: `googleId` y `githubId` ya existen (`String? @unique`) y `findOrCreateOAuthUser` los usa.

- Cookie de sesión: `tensi_token` (SPEC 01), sin cambios.
- Cookie nueva de `state`: `oauth_state`, `httpOnly`, `SameSite=Lax`, `Path=/api/auth`, `Max-Age` ~10 min; se limpia en el callback. Sin `Domain` propio (la emite y la lee el mismo origen de la API).
- URL de retorno: primer valor de `CORS_ORIGIN` (misma fuente que usa `enableCors`), sin env nueva.
- Variables ya presentes (`.env`/`.env.template`):

```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3002/api/auth/google/callback
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK_URL=http://localhost:3002/api/auth/github/callback
```

- Front: usa `NEXT_PUBLIC_API_URL` (ya existente); no hay env nuevas.

## Plan de implementación

**API — `nest-tensi-api`**

1. `src/auth/utils/oauth-state.ts` (nuevo): `createOAuthState(response)` genera un valor aleatorio (`crypto.randomUUID`/`randomBytes`) y lo escribe en la cookie `oauth_state`; `consumeOAuthState(request, response)` compara `request.query.state` con la cookie, la limpia y devuelve si es válida. Verificación: inspección de la cookie emitida y del `state` en la URL.
2. `GoogleAuthGuard` y `GithubAuthGuard`: en el inicio generan el `state` (vía `getAuthenticateOptions(context)`) para que el strategy lo incluya en la URL de autorización. Verificación: `curl -sI /api/auth/google` → 302 a `accounts.google.com` con `state=` y `Set-Cookie: oauth_state=...`.
3. Guard de callback que valida `oauth_state` antes de delegar en passport; si falla, redirige a `/login?error=oauth` sin emitir sesión. Verificación: un callback con `state` distinto no setea `tensi_token`.
4. `auth.controller.ts`: `googleAuthRedirect`/`githubAuthRedirect` reciben `@Res() response`, obtienen el usuario del strategy, emiten la cookie con `getAuthCookieOptions()` y hacen `response.redirect(<front>/dashboard)`. Verificación: `curl -si` muestra `Set-Cookie: tensi_token=...` y `Location: http://localhost:3000/dashboard`.
5. `auth.service.ts`: sustituir `generateJwtResponse` (devolvía `{ user, token }` en JSON) por `issueSessionToken(user): string` (o exponer `generateJwtToken`) y ajustar los dos callbacks. Verificación: `grep generateJwtResponse` sin consumidores y `pnpm build`.
6. Helper `getFrontOrigin()` (primer origen de `CORS_ORIGIN`) usado en éxito/fallo. Verificación: con `CORS_ORIGIN` múltiple se usa el primero.
7. `.env.template`: nota de que los callbacks deben registrarse en las consolas de Google/GitHub. Verificación: documentado.

**Web — `next-tensi-web`**

8. `lib/auth/hooks/use-oauth.ts` (nuevo): `startOAuth(provider)` compone la URL con `NEXT_PUBLIC_API_URL` y navega con `window.location.assign`. Verificación: clic navega a `:3002/api/auth/google`.
9. `components/auth/login-form.tsx`: `OAuthButton` pasa de `disabled` a botón real que llama al hook; se retira "Próximamente". Verificación: clic dispara la navegación y `pnpm lint`/`tsc` pasan.
10. `app/(auth)/login/page.tsx`: leer `searchParams.error` (tipo `PageProps<'/login'>`); si es `"oauth"`, mostrar "No se pudo iniciar sesión con el proveedor. Inténtalo de nuevo." Verificación: `/login?error=oauth` muestra el aviso (Playwright).
11. `grep` final: sin `disabled` en los botones sociales y sin lógica de navegación dentro del componente.

## Criterios de aceptación

Backend:

- [ ] `GET /api/auth/google` responde 302 a Google con `state` y `Set-Cookie: oauth_state=...`.
- [ ] `GET /api/auth/github` responde 302 a GitHub con `state` y `Set-Cookie: oauth_state=...`.
- [ ] Un callback con `state` que no coincide con la cookie NO emite `tensi_token` y redirige a `/login?error=oauth`.
- [ ] Un callback válido (Google) setea `Set-Cookie: tensi_token=...; HttpOnly; SameSite=Lax` y `Location: <front>/dashboard`.
- [ ] Lo mismo para GitHub.
- [ ] Primer login social con email nuevo crea un `User` con `confirmed=true` y `googleId`/`githubId` poblado.
- [ ] Login social con email que ya tiene cuenta local vincula `googleId`/`githubId` al usuario existente (sin crear duplicado).
- [ ] El callback ya no devuelve el token en el body JSON.
- [ ] Sin `GOOGLE_*`/`GITHUB_*` configuradas, la ruta falla con un error claro (no 500 opaco).
- [ ] `pnpm build` y `pnpm lint` de la API pasan.

Frontend:

- [ ] Los botones "Iniciar sesión con Google" y "con GitHub" están habilitados y navegan al endpoint de la API.
- [ ] `/login?error=oauth` muestra un mensaje de error visible y accesible.
- [ ] Tras un login social exitoso, el usuario termina en `/dashboard` con sesión válida (`check-token` 200).
- [ ] `components/auth/login-form.tsx` no contiene estado ni lógica (delega en `use-oauth`).
- [ ] `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build` pasan.

Global:

- [ ] Flujo end-to-end verificado con Playwright (proveedor real, o mock del callback) sin errores de consola.

## Decisiones

- **Sí:** redirect de página completa. Compatible con la cookie httpOnly y sin `postMessage`.
- **Sí:** `state` validado con cookie httpOnly de vida corta. Cierra el login CSRF sin sesión de servidor.
- **Sí:** `CORS_ORIGIN` (primer origen) como origen de retorno. Evita una env extra y ya es el origen del front.
- **Sí:** auto-vincular por email mediante `findOrCreateOAuthUser`. El email de Google es verificado; se documenta el caso GitHub sin email.
- **Sí:** OAuth solo desde `/login`. El mockup de registro no muestra botones sociales y el primer login social ya crea la cuenta.
- **Sí:** la API emite la cookie y redirige; el front no maneja tokens. Coherente con SPEC 01.
- **No:** popup + `postMessage`. Más complejo y sensible a bloqueadores.
- **No:** endpoint JSON + `fetch` desde el front. Exigiría exponer el token al JS.
- **No:** botones sociales en `/register` ni gestión de proveedores en Perfil.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Cookie `tensi_token` emitida por `api.dominio` no visible en el dominio web | `COOKIE_DOMAIN` al dominio padre (SPEC 01) |
| GitHub puede no devolver email (privado) | scope `user:email`; si falta, redirigir a `/login?error=oauth` y documentarlo |
| El `state` en cookie se pierde si el proveedor tarda >10 min | `Max-Age` de 10 min y mensaje de reintento en `/login?error=oauth` |
| `username` de fallback duplicado (no es unique en Prisma) | No rompe; hacerlo único sería otra spec |
| Credenciales/consolas OAuth mal configuradas (callback URL) | Documentar en `.env.template`; el error se ve en la consola del proveedor |
| Verificar E2E con proveedores reales es manual | Verificar inicio/redirect con curl y el callback con un mock; login real como prueba manual |

## Qué **no** entra en esta spec

- Botones sociales en `/register`.
- Vincular/desvincular proveedores desde Perfil.
- Popup + `postMessage`.
- Refresh tokens y "recordarme".
- 2FA.

Cada uno, si se implementa, va en su propia spec.
