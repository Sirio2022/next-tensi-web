# SPEC 09 — Endurecimiento frente a XSS (front y back)

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 05
> **Date:** 2026-10-04
> **Objective:** Auditar y endurecer `next-tensi-web` y `nest-tensi-api` frente a XSS (CSP, headers de seguridad, higiene de render y validación), verificando que el JWT sigue viviendo solo en cookie httpOnly y sin reabrir una vía que lo exponga a JS.

## Por qué existe esta spec

- SPEC 01 ya movió el JWT a cookie `HttpOnly` y eliminó `token` del body de `login`/`check-token`; SPEC 05 endureció `lib/http`. Pero no hay una capa explícita anti-XSS: `next.config.ts` solo define `typedRoutes` y la API no usa Helmet.
- El `JwtStrategy` de Nest sigue aceptando `Authorization: Bearer` como fallback, lo que contradice el objetivo de SPEC 01 (si un cliente usa Bearer, el token acaba en JS).
- No existe CSP, ni `X-Content-Type-Options`, ni `frame-ancestors`, ni una regla que prohíba renderizar HTML de usuario.
- Auditoría de partida (grep): el front **no** usa `dangerouslySetInnerHTML`, `innerHTML`, `eval` ni `new Function`, y toda navegación va por `next/link` (SPEC 07). El riesgo es de endurecimiento, no de una vulnerabilidad activa conocida.

## Alcance

**In:**

- **Front `next-tensi-web`:** cabeceras de seguridad y CSP (primero `Report-Only`, luego enforce) en `next.config.ts`; regla ESLint que prohíbe `dangerouslySetInnerHTML`; regla de sanitización documentada (sin librería por ahora); verificación de que React escapa datos de usuario.
- **Back `nest-tensi-api`:** Helmet con CSP y cabeceras; retirar el fallback `Bearer` del `JwtStrategy`; fail-fast de `COOKIE_SECURE` en producción; `trust proxy` para cookies `Secure`; validación del body de `resend-verification-code`; Swagger solo fuera de producción.
- **Reporte de auditoría** en `docs/security/`, con convención análoga a `docs/react/` y `docs/a11y/`.

**Out of scope (para specs futuras):**

- CSRF explícito (token/origen). `SameSite=Lax` + CORS se mantienen; si se pasa a dominios cruzados, va en su propia spec.
- Rate limiting / throttling, rotación de refresh tokens ("recordarme").
- Sanitización con librería (`dompurify`, `sanitize-html`) y render de rich text: se documenta la regla, se decide la librería cuando exista contenido HTML.
- Persistencia/API de las notas de `bp-readings` (sin API todavía, SPEC 08).
- Tests automatizados con runner nuevo (el front no tiene runner).
- Reescritura del flujo de sesión de SPEC 01/05.

## Modelo de datos

No hay modelos de base de datos ni tipos de dominio nuevos.

- El único dato nuevo es configuración de entorno:
  - `next-tensi-web`: `CSP_ENFORCE` (opcional, `true` para pasar de `Content-Security-Policy-Report-Only` a `Content-Security-Policy`). El origen de la API se deriva de `NEXT_PUBLIC_API_URL`.
  - `nest-tensi-api`: sin variables nuevas; `COOKIE_SECURE=true` pasa a ser **obligatoria** con `NODE_ENV=production`.
- El contrato de la cookie (SPEC 01) **no cambia**: `HttpOnly; SameSite=Lax; Path=/; Max-Age=<JWT_EXPIRES_IN>; [Secure]; [Domain=<COOKIE_DOMAIN>]`.

## Plan de implementación

### Front — `next-tensi-web`

1. **Cabeceras de seguridad en `next.config.ts`** con `async headers()` aplicadas a `/:path*`: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `Cross-Origin-Opener-Policy: same-origin`.
   _Verificación:_ `curl -sI http://localhost:3000/` muestra todas las cabeceras.
2. **CSP en modo Report-Only** con: `default-src 'self'; script-src 'self' 'unsafe-inline'` (+ `'unsafe-eval'` solo en dev); `style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' <origen API>; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests` (prod). Enviar como `Content-Security-Policy-Report-Only`.
   _Verificación:_ la cabecera aparece en la respuesta; la consola no bloquea nada.
3. **Switch a enforce** con `CSP_ENFORCE=true` (misma lista, cabecera `Content-Security-Policy`).
   _Verificación:_ con la CSP activa, login → dashboard funciona sin violaciones en consola.
4. **Prohibir HTML de usuario por lint:** añadir `"react/no-danger": "error"` en `eslint.config.mjs` (el plugin `react` ya está registrado).
   _Verificación:_ `pnpm lint` pasa; un `dangerouslySetInnerHTML` temporal hace fallar el lint.
5. **Documentar la regla de sanitización** (sin librería): todo dato de usuario se renderiza como texto por React; queda prohibido `dangerouslySetInnerHTML` con datos de usuario. Se ubica en `docs/security/`.
   _Verificación:_ el reporte contiene la regla y la justificación de no añadir dependencia aún.
6. **Auditoría del front** en `docs/security/01-auditoria-xss.md`: superficie de render, ausencia de vectores (`dangerouslySetInnerHTML`/`innerHTML`/`eval`), manejo de errores de la API como texto, `NEXT_PUBLIC_*` sin secretos.

### Back — `nest-tensi-api`

1. **Instalar Helmet** (`pnpm add helmet`) y montarlo en `src/main.ts` con CSP estricta para respuestas JSON (`default-src 'none'; frame-ancestors 'none'`) y `crossOriginResourcePolicy`, `frameguard`, `referrerPolicy`, `noSniff`, `hsts`.
   _Verificación:_ `curl -sI` de un endpoint muestra las cabeceras de Helmet.
2. **Swagger solo fuera de producción:** envolver `SwaggerModule.setup('api', …)` en `if (process.env.NODE_ENV !== 'production')`; en dev, relajar la CSP de Helmet lo necesario para la UI de Swagger (o desactivarla en ese path).
   _Verificación:_ en dev `/api` sigue funcionando; simulando `NODE_ENV=production`, `/api` no se sirve.
3. **Retirar el fallback `Bearer`** en `src/auth/strategies/jwt.strategy.ts`: dejar solo `cookieExtractor` (quitar `ExtractJwt.fromAuthHeaderAsBearerToken()`).
   _Verificación:_ `check-token` con solo `Authorization: Bearer` → 401; con cookie → 200.
4. **Fail-fast de `COOKIE_SECURE`:** en `getAuthCookieOptions()`, si `NODE_ENV === 'production'` y `COOKIE_SECURE !== 'true'`, lanzar error al arrancar. Actualizar `.env.template` y `README` con la obligatoriedad.
   _Verificación:_ con `NODE_ENV=production` y sin `COOKIE_SECURE=true`, el arranque falla con mensaje claro.
5. **`trust proxy`:** `app.set('trust proxy', 1)` en `main.ts` para que las cookies `Secure` funcionen detrás de proxy (Docker/VPS).
   _Verificación:_ el `Set-Cookie` incluye `Secure` cuando `COOKIE_SECURE=true` detrás del proxy.
6. **Validar `resend-verification-code`:** crear `ResendVerificationDto` con `@IsEmail()` y usarlo en `auth.controller.ts` en lugar del body inline.
   _Verificación:_ un body sin email válido devuelve 400.
7. **Auditoría del back** en `docs/security/`: revisar cookie (`HttpOnly`/`SameSite`/`Secure`), CORS explícito con `credentials`, `ValidationPipe` (`whitelist` + `forbidNonWhitelisted`), ausencia de interpolación de datos de usuario en respuestas y `pnpm audit` en ambos repos.
8. **Decisión `__Host-`:** se evalúa y **no** se adopta ahora (rompe el caso cross-subdominio de `COOKIE_DOMAIN` de SPEC 01 y el `proxy.ts` del front codifica el nombre de la cookie); se deja documentado como mejora futura condicionada a un dominio padre único.

## Criterios de aceptación

- [ ] `curl -sI http://localhost:3000/` muestra `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` y `Referrer-Policy`.
- [ ] La respuesta del front incluye `Content-Security-Policy-Report-Only` con `object-src 'none'`, `base-uri 'self'` y `frame-ancestors 'none'`.
- [ ] Con `CSP_ENFORCE=true`, la cabecera pasa a `Content-Security-Policy` y login → dashboard funciona sin violaciones en consola.
- [ ] `pnpm lint` en el front falla si se introduce un `dangerouslySetInnerHTML` (regla `react/no-danger`), y pasa en el estado normal.
- [ ] Un dato de usuario con payload (`<img src=x onerror=alert(1)>`) enviado como username/email se renderiza como texto y **no** ejecuta nada (Playwright, sin `dialog`).
- [ ] Un mensaje de error de la API con HTML se muestra como texto en el formulario, sin inyección.
- [ ] `curl -sI` de un endpoint de la API devuelve las cabeceras de Helmet (`X-Content-Type-Options: nosniff`, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`, HSTS).
- [ ] Con `NODE_ENV=production`, `GET /api` (Swagger) no se sirve; en dev sigue disponible.
- [ ] `GET /api/auth/check-token` con solo `Authorization: Bearer` devuelve 401; con la cookie devuelve 200.
- [ ] Con `NODE_ENV=production` y sin `COOKIE_SECURE=true`, el arranque de la API falla con mensaje explícito.
- [ ] `POST /api/auth/resend-verification-code` con un email inválido devuelve 400.
- [ ] `pnpm audit` (front y back) no reporta vulnerabilidades altas/críticas sin justificar.
- [ ] `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build` pasan en el front; `pnpm build` y `pnpm lint` pasan en la API.
- [ ] Existe `docs/security/01-auditoria-xss.md` con hallazgos, reglas y evidencia, siguiendo la convención de `docs/react/` y `docs/a11y/`.

## Decisiones

- **Sí:** cookie httpOnly como única vía del JWT (ya en SPEC 01); esta spec **no la reimplementa**, la audita y elimina el fallback que la contradice.
- **Sí:** cabeceras estáticas en `next.config.ts` + Helmet en Nest; sin nonce (no fuerza render dinámico y convive con `proxy.ts`).
- **Sí:** CSP primero `Report-Only`, luego enforce con `CSP_ENFORCE`, para detectar violaciones antes de bloquear.
- **Sí:** orígenes permitidos: `'self'`, la API (`NEXT_PUBLIC_API_URL`) y Google Fonts (aunque `next/font/google` autohospeda). No hay otros recursos externos hoy.
- **Sí:** retirar `Authorization: Bearer` del `JwtStrategy`; la cookie es la fuente única.
- **Sí:** Swagger solo en dev/protegido.
- **Sí:** fail-fast de `COOKIE_SECURE` en producción; `trust proxy` para cookies `Secure`.
- **No:** prefijo `__Host-` ahora (conflicto con `COOKIE_DOMAIN` y con `proxy.ts`); documentado.
- **No:** librería de sanitización todavía (no hay rich text); se deja la regla escrita.
- **No:** CSRF explícito, rate limiting ni refresh tokens en esta spec.
- **Sí:** reporte de auditoría en `docs/security/`.

## Riesgos

| Riesgo                                                                                                      | Mitigación                                                                             |
| ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| La CSP estricta rompe Swagger UI en la API                                                                  | Mantener Swagger solo en dev y relajar/desactivar CSP en ese path                      |
| `'unsafe-inline'` en `script-src` (necesario por los scripts inline de Next sin nonce) reduce la protección | Aceptado y documentado; alternativa futura: nonce por request (fuerza render dinámico) |
| Retirar `Bearer` rompe clientes que aún lo usan (p. ej. un móvil)                                           | Verificar consumidores con `grep`; si existe uno, coordinar antes de retirarlo         |
| `trust proxy` mal configurado puede aceptar cabeceras `X-Forwarded-*` falsas                                | Fijarlo a `1` (un solo proxy, el de Docker/VPS)                                        |
| Las violaciones de CSP en dev se confunden con errores de la app                                            | Revisar primero en Report-Only y limpiar las violaciones antes de enforce              |

## Qué **no** entra en esta spec

- CSRF explícito (token de doble envío / verificación de origen).
- Rate limiting y hardening más amplio tipo OWASP.
- Sanitización de rich text y la librería correspondiente.
- Persistencia/API de notas de `bp-readings`.
- Tests automatizados con runner nuevo.

Cada uno, si se implementa, va en su propia spec.
