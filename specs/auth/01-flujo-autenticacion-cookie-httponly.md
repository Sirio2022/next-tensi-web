# SPEC 01 — Flujo de autenticación con cookie httpOnly

> **Status:** Aprobada
> **Depends on:** —
> **Date:** 2026-10-01
> **Objective:** Implementar el flujo de autenticación email/password en la web Next con el JWT en una cookie httpOnly, la lógica en hooks y un dashboard mínimo protegido.

## Por qué existe esta spec

- La API Nest (`nest-tensi-api`) ya tiene el flujo completo: `register`, `verify-email`, `login`, `check-token`, `forgot-password`, `reset-password`.
- La web es scaffolding de `create-next-app`: no hay rutas de auth, ni cliente HTTP, ni tokens de diseño.
- Se decide guardar el JWT en **cookie httpOnly** en lugar de `localStorage`, lo que obliga a cambios coordinados en ambos repos.
- OAuth existe en la API (Google/GitHub) pero se difiere.

## Alcance

**In:**

- Backend `nest-tensi-api`: emisión de cookie httpOnly, extracción de cookie en la estrategia JWT, endpoint `logout`, CORS con origen explícito y opciones de cookie por variable de entorno.
- Web `next-tensi-web`: las 5 pantallas de auth de los mockups, adaptador HTTP, schemas de validación, hooks y formularios, `proxy.ts` + DAL, dashboard mínimo protegido y tokens de diseño unificados.
- Redirecciones y estados de carga/error de cada formulario.

**Out of scope (para specs futuras):**

- Landing pública y sus modales (SPEC 02).
- OAuth Google/GitHub.
- Cambio de contraseña desde perfil (`POST /api/users/profiles/update-password`).
- Resto de la app: `bp-readings`, analytics, planes y guard `premium-plan`.
- Refresh token rotativo y "recordarme" (existe el modelo `RefreshToken` pero no hay endpoints).
- Tests automatizados (el repo no tiene runner).

## Modelo de datos

No hay modelos de base de datos nuevos. Se reutiliza `User` de `prisma/schema.prisma` (`id`, `username`, `email`, `plan: FREE | PREMIUM`).

Tipos nuevos en la web (`lib/auth/types.ts`):

```ts
export type Plan = "FREE" | "PREMIUM"

export interface AuthUser {
  id: string
  username: string
  email: string | null
  plan: Plan
}

// GET /api/auth/check-token  → { user }
export interface CheckTokenResponse {
  user: AuthUser
}

// register / verify-email / resend / forgot / reset / logout
export interface MessageResponse {
  message: string
}

// Forma estandarizada de AllExceptionsFilter
export interface ApiError {
  statusCode: number
  timestamp: string
  path: string
  response: string | { message?: string | string[]; error?: string }
  details?: string | string[]
}
```

Contrato de la cookie que emite la API:

```http
Set-Cookie: tensi_token=<jwt>; HttpOnly; Path=/; SameSite=Lax; Max-Age=<JWT_EXPIRES_IN>; [Secure]; [Domain=<COOKIE_DOMAIN>]
```

Variables nuevas en `nest-tensi-api/.env` y `.env.template`:

```bash
CORS_ORIGIN=http://localhost:3000
COOKIE_NAME=tensi_token
COOKIE_DOMAIN=            # vacío en local; .tensi.com en producción
COOKIE_SECURE=false       # true en producción
```

Variables nuevas en `next-tensi-web/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3002/api
```

## Arquitectura del front

- **HTTP:** adaptador `HttpClient` con implementación `fetch` (`credentials: 'include'`). Dos instancias: `http` (navegador) y `httpServer` (server-side, reenvía el header `Cookie`). Toda la app depende de la interfaz, nunca de `fetch` directo.
- **Formularios:** React Hook Form + `zodResolver`. Los schemas zod son la única fuente de verdad de validación del cliente y replican la política del backend.
- **Componentes:** presentacionales, sin lógica. `FormField`, `PasswordField` y `CodeField` reutilizables.
- **Hooks:** `useAuth` concentra la lógica de negocio del cliente; un `use-*-form` por pantalla concentra el wiring de RHF.
- **Server:** `verifySession()` es una DAL server-only memoizada con `cache()`; no es un hook.

```text
lib/
  http/types.ts            # interfaz HttpClient
  http/fetch-client.ts     # implementación fetch + normalización de ApiError
  http/http.ts             # http (browser) y httpServer (server)
  auth/types.ts            # AuthUser, respuestas, ApiError
  auth/schemas.ts          # zod: register, login, verify, forgot, reset
  auth/auth.api.ts         # register(), verifyEmail(), login(), logout(), checkToken()…
  auth/dal.ts              # verifySession() server-only + cache()
  auth/auth-context.tsx    # AuthProvider (recibe initialUser del server)
  auth/hooks/use-auth.ts   # lógica de negocio: acciones, estado, errores, redirects
  auth/hooks/use-login-form.ts
  auth/hooks/use-register-form.ts
  auth/hooks/use-verify-form.ts
  auth/hooks/use-forgot-form.ts
  auth/hooks/use-reset-form.ts
components/
  form/form-field.tsx      # label + input + error, atado a RHF
  form/password-field.tsx
  form/code-field.tsx      # 6 dígitos
  auth/*-form.tsx          # presentacionales: solo renderizan FormField
```

## Plan de implementación

**Backend — `nest-tensi-api`**

1. Instalar `cookie-parser` y `@types/cookie-parser` con `pnpm add`. Verificación: `pnpm build` compila.
2. En `src/main.ts`: `app.use(cookieParser())` y reemplazar `origin: '*'` por `origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000').split(',')`, manteniendo `credentials: true`. Verificación: el preflight desde `http://localhost:3000` devuelve el origen permitido y no `*`.
3. Crear `src/auth/utils/cookie-options.ts` con las opciones de cookie leyendo `COOKIE_NAME`, `COOKIE_DOMAIN`, `COOKIE_SECURE` y `JWT_EXPIRES_IN`.
4. En `auth.controller.ts`, inyectar `@Res({ passthrough: true })` en `login` y `check-token` para setear la cookie. Verificación: Swagger (`http://localhost:3002/api`) muestra `Set-Cookie` en la respuesta del login.
5. Quitar `token` de las respuestas de `auth.service.login` (queda `{ message }`) y de `auth.service.checkToken` (queda `{ user }`). Verificación: el body ya no lo incluye.
6. En `JwtStrategy`, extraer el JWT de la cookie y del header: `ExtractJwt.fromExtractors([cookieExtractor, ExtractJwt.fromAuthHeaderAsBearerToken()])`. Verificación: `check-token` funciona solo con la cookie.
7. Añadir `POST /api/auth/logout` (`@HttpCode(200)`) que limpia la cookie. Verificación: `check-token` → 200, `logout` → 200, `check-token` → 401.
8. Actualizar `.env.template` con las cuatro variables nuevas.

**Web — `next-tensi-web`**

9. Instalar `react-hook-form`, `@hookform/resolvers` y `zod`.
10. Crear `lib/http/types.ts`, `lib/http/fetch-client.ts` y `lib/http/http.ts` con las dos instancias. Verificación: una llamada de prueba a `check-token` devuelve 401 sin romper.
11. Crear `lib/auth/types.ts` con los tipos del modelo de datos.
12. Crear `lib/auth/schemas.ts` con los schemas zod (mín. 6, 1 mayúscula, 1 minúscula, 1 número; código de 6 dígitos).
13. Crear `lib/auth/auth.api.ts` con las llamadas a cada endpoint usando el adaptador.
14. Crear `lib/auth/dal.ts` con `verifySession()` memoizado con `cache()`, que llama a `check-token` reenviando la cookie y devuelve `AuthUser | null`.
15. Crear `lib/auth/hooks/use-auth.ts` con login, registro, verificación, reenvío, forgot, reset y logout; expone estado y errores.
16. Crear `lib/auth/auth-context.tsx` con `AuthProvider` (recibe `initialUser`) y `useAuthContext`.
17. Crear `components/form/form-field.tsx`, `password-field.tsx` y `code-field.tsx`, atados a RHF y con el mensaje de error de zod debajo del campo.
18. Crear los cinco hooks `use-*-form` (register, verify, login, forgot, reset) combinando `useForm` + `zodResolver` + `useAuth`.
19. En `app/globals.css` y `app/layout.tsx`: escalas de color unificadas para toda la app (ver decisiones), tipografía Plus Jakarta Sans vía `next/font/google`, `lang="es"` y metadata "Tensi".
20. Crear `app/(auth)/layout.tsx` con el shell compartido (header y footer) según los mockups.
21. `app/(auth)/register/page.tsx`: formulario username/email/password; `POST /auth/register`; al 200 redirige a `/verify-account?email=...`.
22. `app/(auth)/verify-account/page.tsx`: email precargado + 6 inputs de dígito; `POST /auth/verify-email`; al 200 redirige a `/login`; botón "Reenviar código" → `POST /auth/resend-verification-code`.
23. `app/(auth)/login/page.tsx`: email/password; `POST /auth/login`; al 200 `router.push('/dashboard')`; enlace a `/forgot-password`; botones Google/GitHub deshabilitados con aviso "Próximamente".
24. `app/(auth)/forgot-password/page.tsx`: email; `POST /auth/forgot-password`; redirige a `/reset-password?email=...`.
25. `app/(auth)/reset-password/page.tsx`: email + 6 dígitos + nueva contraseña; `POST /auth/reset-password`; al 200 redirige a `/login`.
26. Crear `proxy.ts` en la raíz: chequeo optimista sin red. Si el matcher coincide y no existe la cookie `tensi_token`, redirige a `/login`. `matcher: ['/dashboard/:path*']`.
27. `app/(dashboard)/dashboard/page.tsx`: Server Component que llama `verifySession()`; si devuelve `null`, `redirect('/login')`; si no, muestra username/email/plan y un botón de logout.
28. Logout: botón cliente que llama `POST /auth/logout` con `credentials: 'include'`, luego `router.push('/login')` y `router.refresh()`.

## Criterios de aceptación

- [ ] `docker compose up -d` en `nest-tensi-api` y `pnpm start:dev` levantan la API en `http://localhost:3002` sin errores.
- [ ] Swagger responde en `http://localhost:3002/api`.
- [ ] `POST /api/auth/register` crea un usuario con `confirmed=false` y devuelve `{ message }` sin token.
- [ ] Registrar un email ya existente devuelve 409 con mensaje legible en la UI.
- [ ] `POST /api/auth/verify-email` con el código correcto confirma la cuenta; con código inválido o expirado devuelve 400 y la UI lo muestra.
- [ ] El botón "Reenviar código" llama a `resend-verification-code` y muestra confirmación.
- [ ] `POST /api/auth/login` con credenciales válidas devuelve 200 y un `Set-Cookie: tensi_token=...; HttpOnly; SameSite=Lax; Path=/`.
- [ ] La respuesta de `login` y `check-token` **no** contiene `token` en el body.
- [ ] Login con contraseña incorrecta devuelve 401 y la UI muestra el error sin romperse.
- [ ] `GET /api/auth/check-token` con la cookie devuelve `{ user }`; sin cookie devuelve 401.
- [ ] Con sesión válida, `GET /dashboard` renderiza username, email y plan.
- [ ] Sin cookie, `GET /dashboard` redirige a `/login` (vía `proxy.ts`) antes de renderizar contenido.
- [ ] `POST /api/auth/logout` limpia la cookie y un `check-token` posterior devuelve 401.
- [ ] `POST /api/auth/forgot-password` con email existente devuelve 200; con email inexistente devuelve 404.
- [ ] `POST /api/auth/reset-password` con código y contraseña válidos devuelve 200 y permite loguear con la nueva.
- [ ] El registro con contraseña débil se bloquea en el cliente antes de llamar a la API.
- [ ] Los componentes en `components/auth/*` no importan `lib/http` ni declaran reglas de validación.
- [ ] `FormField` se reutiliza en las 5 pantallas y muestra el mensaje de error de zod bajo el campo.
- [ ] Un submit inválido no dispara ninguna request a la API.
- [ ] Cambiar el cliente HTTP requiere tocar solo `lib/http/fetch-client.ts`.
- [ ] CORS devuelve `Access-Control-Allow-Origin: http://localhost:3000` (nunca `*`) en las respuestas del API.
- [ ] Ninguna pantalla de auth rompe con `pnpm lint` ni con `pnpm exec tsc --noEmit`.

## Decisiones

- **Sí:** cookie httpOnly emitida por la API Nest. Protege el JWT de XSS y sirve a todos los endpoints autenticados futuros.
- **No:** `localStorage` + Bearer. Es lo que el backend ya devolvía, pero expone el token a JS.
- **No:** BFF en Next con route handlers. Evita tocar el backend, pero obliga a proxear todas las llamadas autenticadas a partir de ahora.
- **Sí:** eliminar `token` del body de `login`/`check-token`. Evita que el front lo persista y contradiga la cookie.
- **Sí:** `proxy.ts` solo con chequeo optimista (presencia de cookie) y verificación real en la DAL. Es el patrón recomendado por los docs de Next 16.
- **Sí:** `fetch` detrás de un adaptador `HttpClient`. Conserva la memoización y el caching de Next y mantiene la decisión reversible.
- **No:** Axios como cliente por defecto. Se puede cambiar implementando la misma interfaz si aparece una necesidad concreta (timeouts finos, progreso de subida de avatar).
- **Sí:** React Hook Form + `zodResolver`, con los schemas zod como única fuente de verdad del cliente.
- **Sí:** componentes presentacionales, lógica en `useAuth` y en un hook por formulario, y `FormField` reutilizable.
- **Sí:** parametrizar `COOKIE_NAME`, `COOKIE_DOMAIN`, `COOKIE_SECURE` y `CORS_ORIGIN` por entorno.
- **Sí:** `SameSite=Lax`. Suficiente entre subdominios del mismo sitio.
- **Sí:** una sola escala de color para toda la app. Las pantallas de auth se alinean a la paleta de la landing (SPEC 02) en lugar de mantener `brand` en auth y `tensi` en landing.
- **No:** OAuth Google/GitHub en esta spec. El callback de la API devuelve JSON y necesita su propio diseño.
- **No:** refresh token rotativo. Existe `RefreshToken` en Prisma pero sin endpoints; el TTL de 1 día alcanza para esta fase.
- **Sí:** dashboard mínimo. Permite verificar la sesión end-to-end sin depender de features futuras.

## Riesgos

| Riesgo                                                                                                                          | Mitigación                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| La cookie es host-only y en producción web y API pueden estar en dominios distintos, dejando al server de Next sin poder leerla | Definir `COOKIE_DOMAIN` al dominio padre; si no es posible, la protección server-side cae y habría que ir a BFF o a protección cliente |
| CSRF al autenticar por cookie                                                                                                   | `SameSite=Lax` + CORS con origen explícito; si se pasa a dominios cruzados, añadir CSRF token                                          |
| `check-token` renueva la cookie pero un Server Component no puede reenviar `Set-Cookie` al navegador                            | No depender del refresh: el TTL de la cookie iguala `JWT_EXPIRES_IN` (1d). Si hace falta, exponer `check-token` vía Route Handler      |
| `proxy.ts` corre en cada ruta, incluidos prefetch                                                                               | Solo lectura de cookie, sin red ni base de datos                                                                                       |
| El `origin: '*'` actual es incompatible con cookies                                                                             | Reemplazado por `CORS_ORIGIN` explícito en el paso 2                                                                                   |
| El error del API viene anidado (`response.response.message`) y puede ser `string[]`                                             | Parser centralizado en `lib/http/fetch-client.ts`                                                                                      |

## Qué **no** entra en esta spec

- Landing pública y sus modales (SPEC 02).
- OAuth Google/GitHub.
- Edición de perfil y cambio de contraseña autenticado.
- `bp-readings`, analytics, planes y `premium-plan`.
- Refresh tokens y "recordarme".
- Tests automatizados.

Cada uno, si se implementa, va en su propia spec.
