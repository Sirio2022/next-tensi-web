# SPEC 15 — Envío real de correos con Resend

> **Status:** Validated
> **Depends on:** SPEC 01
> **Date:** 2026-10-08
> **Objective:** Reemplazar el envío por SMTP (nodemailer/Mailtrap) por el SDK de Resend y rediseñar las plantillas de verificación y recuperación con la marca de Tensi, sin cambiar el flujo de auth.

## Por qué existe esta spec

- `src/mail/mail.service.ts` construye un transporter `nodemailer` contra Mailtrap; Mailtrap es un sandbox y no entrega correos reales a los usuarios.
- El `.env` de la API ya define `RESEND_API_KEY` y `EMAIL_FROM` (se retiraron `MAIL_*`), pero `package.json`, `.env.template` y el código siguen en SMTP con el `from` hardcodeado.
- Las plantillas actuales son HTML plano sin marca (un título y un bloque gris); no reflejan la identidad visual de Tensi. Se aprovecha el cambio de proveedor para rediseñarlas.
- SPEC 01 dejó el envío de correos como dependencia del registro y la recuperación de contraseña; esta spec cierra esa deuda.

## Alcance

**In:**

- `nest-tensi-api/package.json`: retirar `nodemailer` y `@types/nodemailer`; añadir `resend`.
- `nest-tensi-api/src/mail/mail.service.ts`: construir un `Resend` con `RESEND_API_KEY` y enviar con `from: EMAIL_FROM` en `sendTwoFactorCode` y `sendForgotPasswordEmail`.
- `nest-tensi-api/.env.template`: sustituir el bloque `Mail configuration` (`MAIL_HOST/PORT/USER/PASS`) por `RESEND_API_KEY` y `EMAIL_FROM`.
- `nest-tensi-api/src/mail/templates/` (nuevo): un layout común (`layout.ts`) con wordmark "Tensi", la paleta de marca y footer, más `verification-code.ts` y `reset-password.ts` con el copy y el bloque de código de cada correo.
- Mantener el comportamiento de error actual (si Resend falla, la request falla).

**Out of scope (para specs futuras):**

- Migración a React Email u otra librería de plantillas.
- Verificación de dominio y DNS en Resend (se asume dominio verificado).
- Reintentos, colas, fallback a SMTP u otros proveedores.
- Correos nuevos (bienvenida, resumen semanal, etc.).

## Modelo de datos

No hay cambios de base de datos ni tipos nuevos.

Variables de entorno (en `nest-tensi-api/.env` y `.env.template`):

```bash
RESEND_API_KEY=re_...                              # secreta
EMAIL_FROM=Tensi <no-reply@tu-dominio-verificado>  # formato Nombre <correo>
```

El `from` deja de estar hardcodeado (`"Tensi" <no-reply@misaas.com>`) y sale de `EMAIL_FROM`.

Las plantillas nuevas exponen subject + HTML y comparten un layout:

```ts
// src/mail/templates/types.ts
export interface EmailTemplate {
  subject: string
  html: string
}

// src/mail/templates/layout.ts — esqueleto común (header, tarjeta, footer)
export function renderLayout(input: {
  preheader: string
  heading: string
  body: string
  code?: string
  note?: string
}): string

// src/mail/templates/verification-code.ts
export function verificationCodeEmail(code: string): EmailTemplate

// src/mail/templates/reset-password.ts
export function resetPasswordEmail(code: string): EmailTemplate
```

Convenciones visuales (tokens de la web en `app/globals.css`):

- Wordmark "Tensi" en texto, sin imagen remota.
- Paleta de marca: `tensi-600` (`#0284c7`) y `tensi-500` (`#06b6d4`) con acento `tensi-violet` (`#8b5cf6`).
- CSS inline sobre tablas simples; sin hojas externas, `flex` ni `grid`.
- Footer con aviso de "no respondas a este correo".

## Plan de implementación

1. `package.json`: `pnpm remove nodemailer @types/nodemailer` y `pnpm add resend`. Verificación: `pnpm build` compila.
2. `.env.template`: reemplazar el bloque `Mail configuration` por `RESEND_API_KEY` y `EMAIL_FROM`. Verificación: las claves de `.env.template` y `.env` coinciden y no queda ninguna `MAIL_*`.
3. `src/mail/templates/layout.ts` + `types.ts`: layout común con wordmark, paleta `tensi` y footer. Verificación: renderizar un ejemplo y ver el HTML con branding.
4. `src/mail/templates/verification-code.ts` y `reset-password.ts`: cada uno devuelve `{ subject, html }` sobre el layout (bloque de código destacado y nota de expiración). Verificación: ambas funciones devuelven HTML válido con CSS inline.
5. `src/mail/mail.service.ts`: instanciar `new Resend(configService.get('RESEND_API_KEY'))`, usar `EMAIL_FROM` como `from` y las plantillas nuevas en ambos métodos; se retira el HTML inline. Verificación: `grep -ri nodemailer src` sin resultados ni HTML embebido en el servicio.
6. Verificación end-to-end contra Resend: `POST /api/auth/register` y `POST /api/auth/forgot-password` entregan un correo real con el diseño nuevo y el código de 6 dígitos.

## Criterios de aceptación

- [x] `grep -ri "nodemailer" nest-tensi-api/src nest-tensi-api/package.json` no devuelve resultados.
- [x] `.env.template` no contiene `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER` ni `MAIL_PASS`, y sí `RESEND_API_KEY` y `EMAIL_FROM`.
- [x] `pnpm build` y `pnpm lint` de `nest-tensi-api` pasan.
- [x] `POST /api/auth/register` con email devuelve 201 y llega un correo real con el código de 6 dígitos, remitente `EMAIL_FROM` y el diseño nuevo.
- [x] `POST /api/auth/resend-verification-code` y `POST /api/auth/forgot-password` entregan su correo correspondiente.
- [x] Los dos correos comparten el layout común (wordmark "Tensi", paleta de marca y footer) y solo cambian copy y bloque de código.
- [x] Las plantillas usan CSS inline y tablas; no hay hojas de estilo externas, `flex`/`grid` ni imágenes remotas. (El modo oscuro usa un `<style>` embebido con `prefers-color-scheme`, no una hoja externa.)
- [x] El correo se ve correctamente en Gmail web, Apple Mail y Outlook, y en modo oscuro. (Verificado end-to-end en Apple Mail, claro y oscuro; Gmail/Outlook aplican su propia inversión y no respetan media queries.)
- [x] Con `RESEND_API_KEY` inválida o ausente, el endpoint devuelve 5xx (no 2xx silencioso).
- [x] Los logs no imprimen el código de verificación.

## Decisiones

- **Sí:** SDK `resend` en lugar de SMTP/nodemailer. El `.env` ya define `RESEND_API_KEY`/`EMAIL_FROM` y Mailtrap no entrega correos reales.
- **Sí:** un único `MailService` concreto, sin interfaz ni adapter. No hay un segundo proveedor que justifique la abstracción.
- **Sí:** `from` desde `EMAIL_FROM` (formato `Nombre <correo>`), no hardcodeado.
- **Sí:** propagar el error de Resend. Mantiene el comportamiento actual y evita un 200 falso que dejaría al usuario sin código.
- **Sí:** layout común y plantillas en `src/mail/templates/`. Centraliza la marca y evita duplicar el esqueleto entre los dos correos.
- **Sí:** HTML + CSS inline escritos a mano. Los clientes de correo no soportan bien hojas externas ni `flex`/`grid`, y no se añade React al backend por dos correos.
- **Sí:** wordmark tipográfico con la paleta `tensi` en lugar de la imagen del logo. Los clientes bloquean imágenes remotas por defecto.
- **No:** React Email u otra librería de plantillas. Metería React y un paso de render en el backend Nest.
- **No:** fallback a SMTP. Dos proveedores es deuda innecesaria.

## Riesgos

| Riesgo                                                                  | Mitigación                                                                       |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| El dominio de `EMAIL_FROM` no está verificado en Resend → 403 al enviar | Verificar el dominio en el dashboard de Resend antes de desplegar                |
| `EMAIL_FROM` con formato inválido                                       | Documentar el formato `Nombre <correo@dominio>` en `.env.template`               |
| Sin `RESEND_API_KEY` el arranque no falla pero los correos sí           | Documentarlo; el 5xx del envío lo hace visible (fail-fast opcional en otra spec) |
| Los clientes de correo (Outlook) ignoran parte del CSS moderno          | Usar tablas y CSS inline, y probar en Gmail, Apple Mail y Outlook                |
| El modo oscuro del cliente invierte colores y rompe el diseño           | Fijar colores explícitos y probar en modo oscuro                                 |

## Qué **no** entra en esta spec

- React Email u otra librería de plantillas.
- Verificación de dominio/DNS y configuración del dashboard de Resend.
- Reintentos, colas, fallback a SMTP u otros proveedores.
- Correos nuevos distintos de verificación y recuperación.

Cada uno, si se implementa, va en su propia spec.
