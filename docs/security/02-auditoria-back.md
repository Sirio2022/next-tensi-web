# Auditoría XSS / endurecimiento — Back (`nest-tensi-api`)

- **Fecha:** 2026-10-04
- **Alcance:** `src/main.ts`, `src/auth/strategies/jwt.strategy.ts`, `src/auth/utils/cookie-options.ts`, `src/auth/auth.controller.ts`, `src/auth/dto/`, `src/common/filters/all-exceptions.filter.ts`, `package.json`, `pnpm-workspace.yaml`, `.env.template` y `README.md`.
- **Spec:** `specs/security/09-endurecimiento-xss-front-back.md` (pasos 7 y 8; el front se audita en `docs/security/01-auditoria-xss.md`).
- **Estándar de referencia:** OWASP — _Cross Site Scripting Prevention_, _REST Security Cheat Sheet_ y atributos de cookie (`HttpOnly`/`Secure`/`SameSite`).
- **Herramientas:** `curl`, Playwright, `pnpm audit`, `pnpm build`, `pnpm lint`.

## Resultado

| Comprobación                                            | Resultado                                                                                                                      |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Helmet (CSP + cabeceras)                                | ✅ `default-src 'none';frame-ancestors 'none'` y resto de Helmet                                                               |
| Cookie httpOnly / SameSite / Secure                     | ✅ `HttpOnly; SameSite=Lax; [Secure]`                                                                                          |
| JWT solo por cookie (sin `Bearer`)                      | ✅ `Bearer` → 401; cookie → 200                                                                                                |
| CORS explícito con `credentials`                        | ✅ origen por lista, `credentials: true`                                                                                       |
| `ValidationPipe` (`whitelist` + `forbidNonWhitelisted`) | ✅ activo; campos extra → 400                                                                                                  |
| Interpolación de datos de usuario en respuestas         | ✅ respuestas JSON; sin HTML construido con datos                                                                              |
| Fail-fast `COOKIE_SECURE` en producción                 | ✅ el arranque falla con mensaje claro                                                                                         |
| `trust proxy` para cookies `Secure`                     | ✅ `Set-Cookie` con `Secure` detrás del proxy                                                                                  |
| Swagger fuera de producción                             | ✅ `NODE_ENV=production` → `/api` y `/api-json` 404                                                                            |
| `resend-verification-code` validado                     | ✅ email inválido → 400                                                                                                        |
| `pnpm audit` back                                       | ✅ 0 altas/críticas de prod (`nodemailer`, `deepmerge-ts`, `multer`, `js-yaml` resueltos); altas restantes solo en tooling dev |
| `pnpm build` / `pnpm lint`                              | ✅ exit 0                                                                                                                      |

## 1. Superficie de respuesta e interpolación

La API solo devuelve **JSON**. El filtro `AllExceptionsFilter` normaliza todas las respuestas de error a:

```json
{ "statusCode": 400, "timestamp": "…", "path": "/api/…", "response": { … }, "details": "…" }
```

- `path` se toma de `request.url` (dato de la petición) pero se serializa como **valor JSON**, no se concatena en HTML.
- Los mensajes de Prisma/Passport son textos fijos; en `P2002` el `target` (nombres de campo) se une a un string, sin HTML.
- No se construye HTML con datos del usuario en ninguna respuesta.

## 2. Cookie de sesión

`src/auth/utils/cookie-options.ts`:

| Atributo   | Valor                                             |
| ---------- | ------------------------------------------------- |
| `httpOnly` | `true` (el JWT no es accesible a JS)              |
| `sameSite` | `'lax'`                                           |
| `path`     | `/`                                               |
| `secure`   | `COOKIE_SECURE === 'true'`                        |
| `maxAge`   | derivado de `JWT_EXPIRES_IN`                      |
| `domain`   | opcional (`COOKIE_DOMAIN`), para cross-subdominio |

Evidencia (prod, `COOKIE_SECURE=true`, `X-Forwarded-Proto: https`):

```
Set-Cookie: tensi_token=…; Max-Age=86400; Path=/; HttpOnly; Secure; SameSite=Lax
```

## 3. CORS

`src/main.ts`:

```ts
app.enableCors({
  origin: (process.env.CORS_ORIGIN ?? "http://localhost:3000").split(","),
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type, Accept, Authorization",
  credentials: true
})
```

Orígenes explícitos (lista separada por comas) y `credentials: true` para que la cookie viaje. No se usa `origin: true`/`*`, que sería incompatible con credenciales.

## 4. Validación de entrada

`ValidationPipe` global con `whitelist: true`, `forbidNonWhitelisted: true` y `transform: true`. Todos los cuerpos pasan por DTOs con `class-validator`.

Caso corregido en esta spec (`resend-verification-code` usaba un tipo inline sin validación): se añadió `ResendVerificationDto` con `@IsEmail()`.

| Petición                          | Resultado                          |
| --------------------------------- | ---------------------------------- |
| `{"email":"no-es-un-email"}`      | **400** (`email must be an email`) |
| `{}`                              | **400**                            |
| `{"email":"a@b.com","foo":"bar"}` | **400** (`forbidNonWhitelisted`)   |
| `{"email":"nadie@tensi.com"}`     | 404 (servicio)                     |

## 5. Helmet y cabeceras

`src/main.ts` monta Helmet con CSP estricta para JSON y activa `crossOriginResourcePolicy`, `frameguard`, `referrerPolicy` (y `noSniff`/`hsts` por defecto).

Evidencia (`curl -sI /api/auth/check-token`):

```
Content-Security-Policy: default-src 'none';frame-ancestors 'none'
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
```

## 6. JWT sin fallback `Bearer`

`src/auth/strategies/jwt.strategy.ts`: `jwtFromRequest: cookieExtractor` (se eliminó `ExtractJwt.fromAuthHeaderAsBearerToken()`).

| Petición a `check-token`         | Resultado |
| -------------------------------- | --------- |
| Solo `Authorization: Bearer <t>` | **401**   |
| Solo cookie `tensi_token`        | **200**   |
| Sin credenciales                 | **401**   |

> Resuelto (posterior): se retiraron los decoradores `@ApiBearerAuth()` obsoletos de `auth`, `users` y `bp-readings`; el OpenAPI ya no declara el esquema `bearer` (`securitySchemes` vacío).

## 7. Fail-fast `COOKIE_SECURE` + `trust proxy`

`assertCookieConfig()` (en `cookie-options.ts`, invocado por `getAuthCookieOptions()` y al arrancar) lanza error si `NODE_ENV=production` y `COOKIE_SECURE !== 'true'`.

| Caso                                           | Resultado                                                                       |
| ---------------------------------------------- | ------------------------------------------------------------------------------- |
| `NODE_ENV=production` sin `COOKIE_SECURE=true` | **exit 1** — `Error: COOKIE_SECURE debe ser "true" cuando NODE_ENV=production…` |
| `NODE_ENV=production COOKIE_SECURE=true`       | arranca                                                                         |

`app.set('trust proxy', 1)` para que la app funcione detrás de un único proxy TLS (Docker/VPS).

## 8. Swagger solo fuera de producción

`SwaggerModule.setup('api', …)` queda envuelto en `if (process.env.NODE_ENV !== 'production')`, con CSP relajada **solo** en sus rutas (`/api`, `/api/swagger-ui*`, `/api/favicon*`, `/api-json`, `/api-yaml`).

| Ruta            | Dev          | Prod         |
| --------------- | ------------ | ------------ |
| `/api` (UI)     | 200          | 404          |
| `/api-json`     | 200          | 404          |
| `/api/auth/...` | CSP estricta | CSP estricta |

## 9. Decisión `__Host-`

**No se adopta el prefijo `__Host-`** en esta spec:

- `__Host-` exige `Secure`, `Path=/` y **sin** `Domain`. El caso cross-subdominio de `COOKIE_DOMAIN` (SPEC 01) dejaría de funcionar.
- El `proxy.ts` del front codifica el nombre de la cookie (`tensi_token`); renombrarla obliga a coordinar ambos repos y a invalidar sesiones existentes.
- Queda documentado como mejora futura **condicionada a un dominio padre único** (sin `Domain` cross-subdominio), donde sí aportaría aislamiento.

## 10. Dependencias (`pnpm audit`)

### Front (`next-tensi-web`)

- **1 alta**: `braces` (vía `eslint-config-next`, **dev**) y **sin parche publicado**. Solo afecta al lint; no viaja al bundle.

### Back (`nest-tensi-api`)

Totales tras los fixes: **14 altas / 7 moderadas / 0 críticas** (antes: 22/14). **Ninguna alta es de producción** (`pnpm audit --prod` → 0 altas / 0 críticas, 2 moderadas); las 14 altas restantes son de tooling de desarrollo (`jest`, `eslint`, `@nestjs/cli`, `webpack`, `ts-jest`, `prisma` CLI) y no se despliegan.

**Aplicados:**

| Cambio                        | Antes     | Después            | Tipo        |
| ----------------------------- | --------- | ------------------ | ----------- |
| `joi` (directa)               | `^18.2.5` | `^18.2.6` (18.2.9) | patch       |
| override `multer@2.2.0`       | 2.2.0     | 2.4.0              | mismo major |
| override `js-yaml@5.2.1`      | 5.2.1     | 5.4.2              | mismo major |
| `nodemailer` (directa)        | `^9.0.5`  | `^10.0.14`         | major       |
| override `deepmerge-ts@7.1.5` | 7.1.5     | 8.0.2              | major       |

Verificado: `pnpm exec prisma generate` (carga `@prisma/config` → `deepmerge-ts` 8) y `pnpm build` pasan; el envío real con `nodemailer` 10 devuelve `SENT` (Mailtrap); login/check-token y Swagger siguen funcionando.

Los overrides viven en `pnpm-workspace.yaml` (pnpm 12 ya no lee `pnpm.overrides` de `package.json`) y usan **selectores de versión exacta** para no tocar las copias de `jest`/`eslint` (`js-yaml@3`/`@4`, etc.).

**Altas de dev restantes (justificadas):** `mysql2`, `fast-uri`, `js-yaml@4` y `brace-expansion`, alcanzables solo desde binarios/herramientas de desarrollo (`prisma` CLI, `@nestjs/cli`, `eslint`, `jest`, `ts-jest`). No forman parte del runtime desplegado; se actualizarán al subir esas herramientas.

## 11. Hallazgos y recomendaciones

**Hallazgos:**

1. Se eliminó el fallback `Bearer`, que contradicía SPEC 01 (única vía: cookie httpOnly).
2. La CSP del API es estricta para JSON; Swagger queda en dev con CSP relajada solo en sus rutas.
3. Fail-fast de `COOKIE_SECURE` y `trust proxy` alineados con despliegue detrás de TLS.
4. `resend-verification-code` ahora valida con DTO (antes tipo inline sin validación).
5. `pnpm audit --prod` sin altas ni críticas tras actualizar `joi`, `multer`, `js-yaml`, `nodemailer` y `deepmerge-ts`.

**Recomendaciones (fuera de esta spec):**

- CSRF explícito si el front y la API pasan a dominios cruzados (hoy `SameSite=Lax` + CORS).
- Reconsiderar `__Host-` si se unifica el dominio padre.
- Actualizar las herramientas de desarrollo (`eslint`, `jest`, `@nestjs/cli`, `prisma`) para limpiar las altas de dev.

## Artefactos

- Salidas de `pnpm audit`, `pnpm build`, `pnpm lint` y las verificaciones `curl` descritas arriba.
- `src/main.ts`, `src/auth/utils/cookie-options.ts`, `src/auth/strategies/jwt.strategy.ts`, `src/auth/auth.controller.ts`, `src/auth/dto/resend-verification.dto.ts`, `src/users/users.controller.ts`, `src/bp-readings/bp-readings.controller.ts`, `package.json`, `pnpm-workspace.yaml` (ver diff del branch `spec-09-endurecimiento-xss-front-back`).
