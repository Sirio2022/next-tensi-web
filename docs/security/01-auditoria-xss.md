# Auditoría XSS — Front (`next-tensi-web`)

- **Fecha:** 2026-10-04
- **Alcance:** `next.config.ts`, `eslint.config.mjs`, `.env.local`, y la superficie de render de `app/`, `components/` y `lib/` (con foco en auth y dashboard).
- **Spec:** `specs/security/09-endurecimiento-xss-front-back.md` (pasos 5 y 6; el back se audita en `docs/security/02-auditoria-back.md`).
- **Estándar de referencia:** OWASP — *Cross Site Scripting Prevention Cheat Sheet* (escape por contexto, sin HTML de usuario, CSP como defensa en profundidad).
- **Herramientas:** `grep`/`rg`, `curl -sI`, Playwright (Chromium), `pnpm lint`, `pnpm audit`.

## Resultado

| Comprobación                                            | Resultado                                                        |
| ------------------------------------------------------- | ---------------------------------------------------------------- |
| Vectores peligrosos (`dangerouslySetInnerHTML`, …)      | ✅ ninguno en `app/`, `components/`, `lib/`, `proxy.ts`           |
| Regla ESLint `react/no-danger`                          | ✅ activa; un uso temporal hace fallar el lint                    |
| Datos de usuario (username con `<img onerror>`)         | ✅ se renderizan como texto; sin `<img>` inyectado ni diálogo     |
| Error de API con HTML                                   | ✅ se muestra como texto; sin `img` interno ni diálogo            |
| Cabeceras de seguridad estáticas                        | ✅ presentes en todas las respuestas                              |
| CSP                                                 | ✅ `Report-Only` por defecto; enforce con `CSP_ENFORCE=true`      |
| `NEXT_PUBLIC_*` sin secretos                            | ✅ solo `NEXT_PUBLIC_API_URL` y `NEXT_PUBLIC_SITE_URL`            |
| `pnpm lint`                                             | ✅ exit 0                                                          |
| `pnpm audit`                                            | ⚠️ 1 alta, dev-only y sin parche (justificada abajo)              |

## 1. Superficie de render (datos de usuario)

La app es App Router con Server Components por defecto. Los únicos puntos donde se pintan datos que provienen del usuario o de la API son:

| Archivo                                        | Dato                        | Forma de render                          |
| ---------------------------------------------- | --------------------------- | ---------------------------------------- |
| `components/auth/form-error.tsx`               | Mensaje de error de la API  | `{message}` dentro de `<p role="alert">` |
| `components/dashboard/user-profile.tsx`        | `username`, `email`         | `{user.username}`, `{user.email}`        |
| `components/dashboard/dashboard-header.tsx`    | Usuario de sesión           | pasa `user` a `UserProfile`              |
| Formularios de auth (`login`, `register`, …)    | Errores de validación       | texto en `<FormError>` / mensajes de RHF |

No hay render de HTML enriquecido, ni campos de texto libre que se muestren fuera de un nodo de texto de React. React escapa por defecto todo lo interpolado como `{…}`.

## 2. Ausencia de vectores

Búsqueda sobre el código de la app (excluye `node_modules/`, `.next/`):

```bash
grep -rnE "dangerouslySetInnerHTML|innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval\(|new Function" \
  app components lib proxy.ts
# → sin resultados
```

| Vector                              | Presente |
| ----------------------------------- | -------- |
| `dangerouslySetInnerHTML`           | ❌ no    |
| `innerHTML` / `outerHTML`           | ❌ no    |
| `insertAdjacentHTML` / `document.write` | ❌ no |
| `eval` / `new Function`             | ❌ no    |

Refuerzo por lint (`eslint.config.mjs`): se añadió `"react/no-danger": "error"`. Evidencia de que la regla muerde:

```text
components/__tmp-danger-check.tsx
  2:15  error  Dangerous property 'dangerouslySetInnerHTML' found  react/no-danger
✖ 1 problem (1 error, 0 warnings)
```

## 3. Regla de sanitización (sin librería)

> **Regla:** todo dato de usuario (nombre, email, mensajes de error de la API, contenido de formularios) se renderiza **como texto** por React (`{dato}`). Queda **prohibido** `dangerouslySetInnerHTML` con datos de usuario; un uso deliberado exige justificación explícita y, si el HTML es de usuario, sanitización previa con librería.

**Justificación de no añadir dependencia todavía:**

- No existe hoy contenido HTML de usuario ni rich text en el producto (la app no tiene editor ni notas con formato; las notas de `bp-readings` no tienen API, SPEC 08).
- React escapa por defecto todos los nodos de texto, y la regla ESLint cierra la puerta al único escape hatch habitual.
- Añadir `dompurify`/`sanitize-html` sin consumidor real suma superficie de dependencia y mantenimiento sin beneficio actual. Se decidirá la librería cuando exista contenido HTML (queda como spec futura).

Además, `lib/http/fetch-client.ts` **normaliza** el error de la API a un `string` (`normalizeMessage`). Si el cuerpo no es JSON (p. ej. el HTML de un proxy), no se propaga el texto crudo: se devuelve `Error <status>`.

## 4. Evidencia de escape (Playwright)

Sesión real contra `http://localhost:3000` con `CSP_ENFORCE=true`, escuchando `dialog` y contando elementos inyectados.

### 4.1 Payload en `username`

Se puso temporalmente `username = <img src=x onerror=alert(1)>` en la DB, se hizo login y se abrió `/dashboard`:

```json
{ "url": "http://localhost:3000/dashboard", "hasLiteral": true, "imgCount": 0, "dialogs": [] }
```

El payload aparece **literal** en el texto del DOM (`hasLiteral: true`), no se creó ningún `<img src="x">` (`imgCount: 0`) y no se disparó ningún diálogo. Username restaurado tras la prueba.

### 4.2 Error de API con HTML

Interceptando `POST /api/auth/login` para responder `400` con `{"response":{"message":"<img src=x onerror=alert(1)>"}}`:

```json
{ "alertText": "<img src=x onerror=alert(1)>", "imgCount": 0, "dialogs": [] }
```

`FormError` muestra el mensaje como texto; `imgCount` del contenedor `role="alert"` es `0` y no hay diálogos.

## 5. Cabeceras de seguridad y CSP

En `next.config.ts`, `headers()` sobre `/:path*`:

| Cabecera                          | Valor                                                        |
| --------------------------------- | ------------------------------------------------------------ |
| `X-Content-Type-Options`          | `nosniff`                                                     |
| `X-Frame-Options`                 | `DENY`                                                        |
| `Referrer-Policy`                 | `strict-origin-when-cross-origin`                             |
| `Permissions-Policy`              | `camera=(), microphone=(), geolocation=()`                    |
| `Cross-Origin-Opener-Policy`      | `same-origin`                                                 |
| `Content-Security-Policy[-Report-Only]` | (ver abajo)                                            |

CSP en **dev** (cabecera `Content-Security-Policy-Report-Only`, o `Content-Security-Policy` con `CSP_ENFORCE=true`):

```text
default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' http://localhost:3002 ws://localhost:* ws://127.0.0.1:*; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
```

Diferencias respecto a la lista de la spec:

- **Dev** añade `'unsafe-eval'` (React lo exige para el stack en desarrollo) y `ws://localhost:* ws://127.0.0.1:*` (HMR y herramientas locales como Console Ninja). Ambas son **solo-dev**.
- **Prod** no incluye ninguna de esas dos y sí incluye `upgrade-insecure-requests`.
- El origen de la API de `connect-src` se **deriva** de `NEXT_PUBLIC_API_URL` (`new URL(...).origin`).

`CSP_ENFORCE` es opcional: ausente o distinto de `"true"` → `Report-Only`; `"true"` → enforce.

### 5.1 Verificación end-to-end bajo enforce

- `curl -sI http://localhost:3000/` devuelve `Content-Security-Policy` con `object-src 'none'`, `base-uri 'self'` y `frame-ancestors 'none'`.
- Playwright: `login (admin@tensi.com) → /dashboard` con la CSP activa → **0 errores y 0 warnings** de consola, sin violaciones.
- Sesión fresca en `/login` bajo enforce → **0 errores y 0 warnings**.

> **Limitación conocida (aceptada en la spec):** `script-src` usa `'unsafe-inline'` porque la app no genera nonce. Un nonce por request eliminaría `'unsafe-inline'`, pero fuerza render dinámico y choca con `proxy.ts`; queda como mejora futura.

## 6. `NEXT_PUBLIC_*` sin secretos

`.env.local` solo define:

```text
NEXT_PUBLIC_API_URL=http://localhost:3002/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Usos: `lib/http/fetch-client.ts` (base de la API) y `app/layout.tsx` (`metadataBase`/OpenGraph). **No hay claves, tokens ni secretos** en variables `NEXT_PUBLIC_*`; cualquier valor con ese prefijo se inlinea en el bundle y se considera público. El JWT vive exclusivamente en cookie `HttpOnly` (SPEC 01), nunca en estos valores.

## 7. Dependencias (`pnpm audit`)

```text
1 vulnerabilities found
Severity: 1 high
braces  <=3.0.3  (patched versions: None)
Paths: .>eslint-config-next>@next/eslint-plugin-next>fast-glob>micromatch>braces
```

**Justificación:** es una dependencia **transitiva de desarrollo** (`eslint-config-next` → … → `braces`), no forma parte del bundle de producción. La vulnerabilidad es un DoS por stack-exhaustion con patrones profundamente anidados durante el lint; no hay versión parcheada publicada. Riesgo aceptado (no hay runtime expuesto). Cuando exista parche, forzar con `pnpm.overrides`.

## 8. Hallazgos y recomendaciones

**Hallazgos:**

1. Sin vulnerabilidad XSS activa: no hay vectores de inyección ni render de HTML de usuario.
2. `connect-src` pasó de inexistente a `'self'` + API; en dev se permiten websockets locales (documentado y solo-dev).
3. `normalizeMessage` descarta cuerpos no-JSON en errores (no se pinta HTML crudo de un proxy).

**Recomendaciones (fuera de esta spec):**

- **CSP con nonce** por request para eliminar `'unsafe-inline'` (requiere render dinámico).
- **Librería de sanitización** (`dompurify`/`sanitize-html`) cuando exista render de HTML de usuario o rich text.
- **`pnpm.overrides` para `braces`** en cuanto aparezca una versión parcheada.
- **CSRF explícito** si el front y la API pasan a dominios cruzados; hoy se apoya en `SameSite=Lax` + CORS.

## Artefactos

- Logs/snapshots de Playwright de la verificación en `.playwright-mcp/` (consola, snapshots y capturas).
- `next.config.ts` y `eslint.config.mjs` modificados en esta spec (ver diff del branch `spec-09-endurecimiento-xss-front-back`).
