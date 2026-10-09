# SPEC 19 — Docker y despliegue en VPS (plan)

> **Status:** Draft
> **Depends on:** SPEC 01, SPEC 09, SPEC 16
> **Date:** 2026-10-09
> **Objective:** Definir el empaquetado Docker y el despliegue de Tensi (web + API + Postgres) en un VPS con reverse proxy y TLS, de forma layout-agnóstica y sin ejecutar el deploy todavía.

## Por qué existe esta spec

- Hoy la web **no tiene Docker** y su `next.config.ts` no usa `output: "standalone"`; la API solo trae un `docker-compose.yaml` para Postgres local (puerto 5433).
- Se contratará un VPS más adelante. El objetivo es **dejar el plan escrito ahora**, para no improvisar el día del deploy, sin ejecutar nada.
- Hay piezas que condicionan el deploy: cookie httpOnly con `COOKIE_DOMAIN`/`COOKIE_SECURE` (SPEC 01), cabeceras/CSP (SPEC 09), OAuth con callbacks por URL (SPEC 16) y `trust proxy` ya configurado en `src/main.ts`.
- Es **layout-agnóstica** porque la migración a monorepo (spec futura) aún no ocurre: describe cómo ajustar los contextos con dos repos (hoy) o con monorepo (después).

## Alcance

**In:**

- `output: "standalone"` en `next.config.ts` (web) — cambio mínimo.
- `Dockerfile` multi-stage de la **web** (deps → build → runner no-root, `node server.js`).
- `Dockerfile` multi-stage de la **API** (`pnpm build` + `prisma generate` → runner `node dist/src/main`, entrypoint con `prisma migrate deploy`).
- `GET /api/health` en la API para healthchecks (cambio mínimo; hoy no existe y Swagger está apagado en prod).
- `compose.yaml` de producción: `proxy` (Caddy), `web`, `api`, `db` (Postgres 15 + volumen), red interna; solo el proxy publica 80/443.
- `Caddyfile` con `tensi.com` (web) y `api.tensi.com` (API) y TLS automático (Let's Encrypt).
- `.env.production.example` con todas las variables y comentarios (basado en el `.env.template` de la API).
- Checklist de provisioning del VPS en `docs/deploy.md`: usuario no-root, Docker Engine, UFW (22/80/443), swap, registros DNS A, fail2ban.
- Backups: `pg_dump` por cron a un volumen.
- Nota de **contextos según layout** (dos repos hoy vs monorepo después).
- **No se ejecuta ningún deploy**: se corre cuando se contrate el VPS.

**Out of scope (para specs futuras):**

- Contratar el VPS / elegir proveedor.
- CI/CD completo (GitHub Actions) → spec aparte.
- Migración a monorepo → spec aparte (se ejecuta **antes** que esta).
- Despliegue de la app Expo (EAS) → spec aparte.
- Kubernetes, alta disponibilidad, multi-región.
- Base de datos gestionada (RDS/Neon) y backups off-site.
- Cambios de producto.

## Modelo de datos

No hay datos nuevos. Se definen artefactos y variables.

Artefactos nuevos: `Dockerfile.web`, `Dockerfile.api`, `compose.yaml`, `Caddyfile`, `.env.production.example`, `docs/deploy.md`.

Dominios y sesión:

| Elemento         | Valor                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------- |
| Web              | `https://tensi.com`                                                                         |
| API              | `https://api.tensi.com` (prefijo `/api`, puerto 3002)                                       |
| Cookie de sesión | `tensi_token`, `COOKIE_DOMAIN=.tensi.com`, `COOKIE_SECURE=true`, `HttpOnly`, `SameSite=Lax` |

Variables de producción (resumen; el detalle va en `.env.production.example`):

- **Web**: `NEXT_PUBLIC_API_URL=https://api.tensi.com`, `NODE_ENV=production`, `CSP_ENFORCE=true`.
- **API**: `NODE_ENV=production`, `PORT=3002`, `DATABASE_URL` (host interno `db`), `POSTGRES_*`, `JWT_SECRET` (fuerte), `JWT_EXPIRES_IN`, `CORS_ORIGIN=https://tensi.com`, `COOKIE_NAME`/`COOKIE_DOMAIN`/`COOKIE_SECURE`, `CLOUDINARY_*`, `MAIL_*`, `GOOGLE_*`/`GITHUB_*` (callbacks a `https://api.tensi.com/api/auth/{google,github}/callback`), `ADMIN_*`, `OPENAI_API_KEY`, `OPENROUTER_API_KEY`.

## Plan de implementación

Steps a ejecutar **cuando se contrate el VPS**; cada uno deja el sistema funcional.

1. **Standalone (web)**: añadir `output: "standalone"` a `next.config.ts`. Verificación: `pnpm build` genera `.next/standalone`.
2. **Health (API)**: `GET /api/health` sin auth (estado de proceso/BD). Verificación: `curl` responde 200.
3. **`Dockerfile.web`**: multi-stage (deps → build → runner `node server.js`, usuario no-root, `NEXT_TELEMETRY_DISABLED=1`). Verificación: `docker build` + `docker run` sirve la web con `NEXT_PUBLIC_API_URL`.
4. **`Dockerfile.api`**: multi-stage (`pnpm install --frozen-lockfile`, `prisma generate`, `pnpm build` → runner), entrypoint que corre `prisma migrate deploy` antes de `node dist/src/main`. Verificación: imagen arranca y migra.
5. **`compose.yaml`**: servicios `proxy`/`web`/`api`/`db`, red interna, volumen de Postgres, `restart: always`, healthchecks. Verificación: `docker compose up -d --build` levanta todo.
6. **`Caddyfile`**: `tensi.com` → web, `api.tensi.com` → api, TLS automático. Verificación: HTTP redirige a HTTPS con certificado válido.
7. **`.env.production.example`**: todas las variables con comentarios. Verificación: contraste con `.env.template` de la API y `.env.local` de la web.
8. **`docs/deploy.md`**: checklist de provisioning (usuario, Docker, UFW, swap, DNS, fail2ban) + primer deploy + backups. Verificación: pasos reproducibles.
9. **Contextos según layout**: documentar la variante dos repos (contexto = raíz de cada repo) y la variante monorepo (contexto = raíz del workspace + filtro). Verificación: el `compose.yaml` deja claro dónde va `context`.
10. **Verificación local** (opcional pero recomendada): `docker compose up --build` en la máquina antes de tocar el VPS.

## Criterios de aceptación

- [ ] `docker compose -f compose.yaml up -d --build` levanta `proxy`, `web`, `api` y `db` sin errores.
- [ ] `https://tensi.com` sirve la web con TLS válido; HTTP redirige a HTTPS.
- [ ] `https://api.tensi.com/api/health` responde 200.
- [ ] Login/registro/refresh funcionan con cookie `tensi_token` (`Domain=.tensi.com`, `Secure`, `HttpOnly`, `SameSite=Lax`).
- [ ] `prisma migrate deploy` migra la BD en el arranque y es idempotente (no usa `db push`).
- [ ] El build de la web usa `standalone`; la imagen final no incluye devDependencies ni secretos.
- [ ] Los contenedores corren como usuario no-root y con `restart: always`.
- [ ] OAuth vuelve por `https://api.tensi.com/api/auth/.../callback` y redirige a `https://tensi.com/dashboard`.
- [ ] La CSP en modo enforce no rompe la app; `connect-src` incluye el origen de la API.
- [ ] `pg_dump` genera un backup restaurable.
- [ ] Ningún secreto queda commiteado (`.env.production` fuera de git).

## Decisiones

- **Sí:** Caddy sobre Nginx+Certbot (TLS automático y config mínima); Traefik como alternativa.
- **Sí:** Postgres en el mismo VPS por coste; base gestionada queda fuera de alcance.
- **Sí:** subdominios separados + cookie `.tensi.com` (coherente con SPEC 01/16).
- **Sí:** `output: "standalone"` en la web (imagen mucho menor).
- **Sí:** `prisma migrate deploy` en el entrypoint (idempotente) en vez de `migrate dev`.
- **Sí:** healthcheck propio `GET /api/health`, porque Swagger está deshabilitado en producción (SPEC 09).
- **Sí:** layout-agnóstica ahora; los contextos se ajustan al migrar a monorepo.
- **Sí:** la migración a monorepo es **prerequisito** de esta spec (se ejecuta antes), pero va en su propia spec.
- **No:** CI/CD completo ahora (spec aparte).
- **No:** Kubernetes/HA ni multi-región.
- **No:** EAS/Expo.
- **No:** exponer Swagger en producción (ya deshabilitado).

## Riesgos

| Riesgo                                                                           | Mitigación                                                                            |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Recursos justos (2 GB) para Postgres + Next + Nest + proxy                       | Recomendar ≥2 vCPU / 4 GB y activar swap; medir antes de escalar.                     |
| Cookie cross-subdominio mal configurada                                          | `COOKIE_DOMAIN=.tensi.com`, `COOKIE_SECURE=true`; `trust proxy` ya está en `main.ts`. |
| CORS mal configurado                                                             | `CORS_ORIGIN=https://tensi.com` exacto (la API lo separa por comas).                  |
| Secretos embebidos en la imagen                                                  | `.dockerignore` + `.env.production` montado, nunca copiado al build.                  |
| Migraciones destructivas en cada arranque                                        | `prisma migrate deploy` idempotente; nunca `db push` en prod.                         |
| Contextos de build distintos en monorepo                                         | Documentar ambas variantes en `docs/deploy.md`.                                       |
| Dependencias externas mal configuradas (Cloudinary, SMTP, Google/GitHub, OpenAI) | Checklist de variables + prueba E2E de login y de subida de avatar.                   |

## Qué **no** entra en esta spec

- Contratar el VPS y elegir proveedor.
- CI/CD completo.
- Migración a monorepo (spec aparte, se ejecuta antes).
- EAS/Expo.
- Kubernetes/HA, managed DB y backups off-site.
- Cambios de producto.

Cada uno, si se implementa, va en su propia spec.
