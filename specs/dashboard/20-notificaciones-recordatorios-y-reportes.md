# SPEC 20 — Notificaciones: recordatorios, alertas médicas y reportes automáticos

> **Status:** Aprobado
> **Depends on:** SPEC 09, SPEC 11, SPEC 14, SPEC 17, SPEC 18
> **Date:** 2026-10-23
> **Objective:** Implementar la sección Notificaciones de Configuración con preferencias persistidas en Nest, recordatorios y reportes por email programados por cron, alertas médicas inmediatas al registrar una lectura y reportes en PDF, dejando Push y En la App como preferencias guardadas sin entrega.

## Por qué existe esta spec

- SPEC 18 dejó `/dashboard/settings/notifications` como `ComingSoonSection` y el mecanismo de gating listo, pero sin contenido. El mockup `references/dashboard/04-profile-premium/notificaciones/` define los cuatro bloques que faltan: Recordatorios de Medición, Alertas Médicas, Reportes Automáticos y Canales de Notificación.
- `nest-tensi-api` no tiene nada de notificaciones: no existe modelo de preferencias, ni `@nestjs/schedule`, ni push. Solo `MailService` con nodemailer sobre SMTP (Mailtrap en desarrollo) y `User` sin zona horaria.
- La alerta médica actual es un `<dialog>` al registrar una lectura; no hay aviso fuera de la pestaña abierta.
- La app tampoco tiene campana ni bandeja in-app, así que "En la App" y Push no pueden entregar nada todavía.
- Se decidió hacer **front + back real** para recordatorios, alertas y reportes por email, y diferir Push a su propia spec.

## Alcance

**In:**

- **Sección Notificaciones** en `/dashboard/settings/notifications` con los cuatro bloques del mockup, botón "Guardar Cambios" en la cabecera y estado dirty.
- **Preferencias persistidas** en Nest (`NotificationPreference` 1:1 con `User`) con endpoint `GET`/`PATCH /notifications/preferences`.
- **Zona horaria IANA por usuario**, capturada desde el navegador al guardar y validada en el back.
- **Recordatorios de medición** por email con cron: diario, dos veces al día o semanal, y solo si el usuario no ha registrado lecturas en la ventana correspondiente.
- **Alertas médicas** por email inmediato al registrar una lectura que cruce los umbrales activos o marque pulso irregular.
- **Reportes automáticos** semanal y mensual: email HTML con resumen + PDF adjunto, generados al cierre del periodo.
- **Canales**: Email real; Push y En la App se guardan y se muestran con nota "Disponible próximamente".
- **Tabla de entregas** `NotificationDelivery` para auditoría e idempotencia.
- **Endpoint de disparo manual** `POST /notifications/dev/run`, disponible solo fuera de producción, para verificar con Mailtrap.
- **Unit tests** de los helpers puros (zona horaria, ventanas, dedupe y resumen del reporte).
- **Portabilidad (SPEC 17)**: tipos, esquemas y helpers puros en `lib/notifications/core/**`; la vista cliente recibe props y usa `AppLink` cuando enlaza.
- **Accesibilidad (SPEC 06)**: switches con `role="switch"`, labels asociados, campos condicionales y responsive 375/1440.

**Out of scope (para specs futuras):**

- **Push web real**: service worker, claves VAPID, suscripciones y entrega.
- **Bandeja in-app**: campana en el header, modelo de notificaciones, estado leído/no leído.
- **UI para configurar día y hora de los reportes**: el mockup no tiene esos campos; se usan valores fijos documentados.
- **Reportes con gráficas** o el PDF clínico completo del export existente.
- **Gating Free/Premium**: ambos planes ven y usan todo igual.
- **Preferencias de idioma o formato** del email; el copy va en español.
- **Reintentos automáticos** de entregas fallidas.
- **Tests e2e** con base de datos real.

## Modelo de datos

### Prisma (back)

```prisma
enum ReminderFrequency {
  DAILY
  TWICE_DAILY
  WEEKLY
}

enum NotificationType {
  REMINDER
  MEDICAL_ALERT
  REPORT_WEEKLY
  REPORT_MONTHLY
}

enum NotificationChannel {
  EMAIL
  PUSH
  IN_APP
}

enum NotificationStatus {
  SENT
  FAILED
}

model NotificationPreference {
  id     String @id @default(uuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Zona horaria IANA, p. ej. "America/Bogota".
  timezone String @default("UTC")

  remindersEnabled   Boolean           @default(false)
  reminderFrequency  ReminderFrequency @default(DAILY)
  reminderTime       String            @default("09:00") // "HH:mm"
  reminderSecondTime String? // solo TWICE_DAILY, "HH:mm"
  reminderWeekday    Int? // solo WEEKLY, ISO 1 (lunes) a 7 (domingo)

  medicalAlertsEnabled  Boolean @default(true)
  alertHighEnabled      Boolean @default(true) // >140/90
  alertLowEnabled       Boolean @default(false) // <90/60
  alertIrregularEnabled Boolean @default(true)

  weeklyReportEnabled  Boolean @default(false)
  monthlyReportEnabled Boolean @default(false)
  reportByEmail        Boolean @default(true)
  reportInApp          Boolean @default(true) // solo preferencia

  channelEmail Boolean @default(true)
  channelPush  Boolean @default(false) // solo preferencia
  channelInApp Boolean @default(true) // solo preferencia

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("notification_preferences")
}

model NotificationDelivery {
  id     String @id @default(uuid())
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  type      NotificationType
  channel   NotificationChannel
  periodKey String // "2026-10-23", "2026-10-23@1", "2026-W43", "2026-10", "reading:<uuid>"
  status    NotificationStatus
  error     String?
  sentAt    DateTime           @default(now())

  // Una sola entrega por usuario, tipo, periodo y canal: si el cron se solapa
  // o se reinicia, la segunda inserción falla y no se duplica el email.
  @@unique([userId, type, periodKey, channel])
  @@index([userId, sentAt(sort: Desc)])
  @@map("notification_deliveries")
}
```

`User` gana las relaciones `notificationPreferences NotificationPreference?` y `notificationDeliveries NotificationDelivery[]`.

Las entregas se insertan **antes** de enviar y se actualizan a `SENT`/`FAILED`. No hay reintento automático de un periodo fallido: se registra y se deja para revisión (evita spam si el SMTP está caído).

### Contrato de la API

```ts
export type ReminderFrequency = "DAILY" | "TWICE_DAILY" | "WEEKLY"

export interface NotificationPreferences {
  timezone: string // IANA
  remindersEnabled: boolean
  reminderFrequency: ReminderFrequency
  reminderTime: string // "HH:mm"
  reminderSecondTime: string | null
  reminderWeekday: number | null // 1..7
  medicalAlertsEnabled: boolean
  alertHighEnabled: boolean
  alertLowEnabled: boolean
  alertIrregularEnabled: boolean
  weeklyReportEnabled: boolean
  monthlyReportEnabled: boolean
  reportByEmail: boolean
  reportInApp: boolean
  channelEmail: boolean
  channelPush: boolean
  channelInApp: boolean
}

// GET /notifications/preferences → { preferences }  (upsert de defaults si no existe)
// PATCH /notifications/preferences { ...campos } → { message, preferences }
```

Validaciones del `PATCH` (class-validator en el DTO + zod espejo en el front):

- `timezone` válida: `Intl.DateTimeFormat(undefined, { timeZone })` no lanza.
- `reminderTime` y `reminderSecondTime`: regex `^([01]\d|2[0-3]):[0-5]\d$`.
- `reminderWeekday`: entero 1–7.
- `reminderSecondTime` obligatorio si `reminderFrequency = TWICE_DAILY`.
- `reminderWeekday` obligatorio si `reminderFrequency = WEEKLY`.
- Si `remindersEnabled = false`, los campos de hora se guardan igual (no se borran).

### Lógica de disparo (valores fijados)

- **Recordatorio diario**: periodKey `YYYY-MM-DD`; se envía a `reminderTime` si no hay ninguna lectura en el día local.
- **Dos veces al día**: periodKeys `YYYY-MM-DD@1` y `YYYY-MM-DD@2`; el primero comprueba lecturas desde el inicio del día local; el segundo, desde `reminderTime`.
- **Semanal**: periodKey ISO `YYYY-Www`; se envía el `reminderWeekday` a `reminderTime` si no hay lecturas en los últimos 7 días.
- **Alerta médica**: al crear una lectura, si `medicalAlertsEnabled` y el toggle concreto están activos: alta = `systolic > 140 || diastolic > 90`; baja = `systolic < 90 || diastolic < 60`; irregular = `irregularHeartBeat === true`. periodKey `reading:<id>`.
- **Reporte semanal**: cubre la semana local anterior (lunes 00:00 a domingo 23:59) y se envía el lunes a las 08:00 locales.
- **Reporte mensual**: cubre el mes natural local anterior y se envía el día 1 a las 08:00 locales.
- Los reportes usan horas fijas porque el mockup no ofrece campos para programarlos.

### Utilidades puras (back)

```ts
// src/notifications/utils/local-time.util.ts
getLocalParts(date: Date, timeZone: string): { year; month; day; weekday; hour; minute }
formatLocalDateKey(date: Date, timeZone: string): string // "YYYY-MM-DD"
formatLocalWeekKey(date: Date, timeZone: string): string // "YYYY-Www"
formatLocalMonthKey(date: Date, timeZone: string): string // "YYYY-MM"
getLocalDayRange(date: Date, timeZone: string): { start: Date; end: Date }
getLocalWeekRange(date: Date, timeZone: string): { start: Date; end: Date }
getLocalMonthRange(date: Date, timeZone: string): { start: Date; end: Date }

// src/notifications/utils/due-notifications.ts
planDueNotifications(preference, now, hasReadingsInWindow): DueNotification[]
```

Se usa `date-fns` + `date-fns-tz` (`formatInTimeZone`, `fromZonedTime`) para que los cambios de horario (DST) no desplacen los envíos. Es una dependencia nueva del back.

### Archivos front

```ts
// lib/notifications/core/types.ts → NotificationPreferences, ReminderFrequency
// lib/notifications/core/schemas.ts → zod con validación condicional
// lib/notifications/core/preferences.ts → defaults, opciones de frecuencia/día, labels
// lib/notifications/notifications.api.ts → getNotificationPreferences / updateNotificationPreferences
// lib/notifications/dal.ts → server-only, reenvía la cookie (patrón de lib/auth/dal.ts)
// lib/notifications/hooks/use-notification-preferences-form.ts → RHF + mutación + timezone + toast
```

`lib/notifications/core/**` no puede importar Next ni usar `window`, `document` o `localStorage` (guard de SPEC 17). La captura de zona horaria con `Intl` vive en el hook, no en `core`.

## Plan de implementación

1. **Modelo y migración** en `nest-tensi-api`: enums, `NotificationPreference`, `NotificationDelivery`, relaciones en `User` y migración Prisma. Verificación: `pnpm prisma generate` y migración aplicada en local.
2. **Módulo y defaults**: `src/notifications/notifications.module.ts`, `notifications.service.ts` con `getOrCreatePreferences(userId)` y `updatePreferences(userId, dto)`; DTO con las validaciones de arriba. Verificación: `GET`/`PATCH` responden con la forma del contrato.
3. **Utilidades de zona horaria**: `local-time.util.ts` + `local-time.util.spec.ts` (incluye un caso DST). Verificación: `pnpm test local-time`.
4. **Planificador puro**: `due-notifications.ts` + spec con los casos diario/dos veces/semanal, ventanas con y sin lecturas y dedupe. Verificación: `pnpm test due-notifications`.
5. **Emails**: métodos `sendMeasurementReminder`, `sendMedicalAlert` y `sendPeriodicReport` en `src/mail/mail.service.ts` (copy español, HTML escapado, adjunto opcional). Verificación: envío manual a Mailtrap desde un test de integración mínimo o el trigger del paso 8.
6. **Alerta médica al registrar**: `bp-readings.service.ts` llama a `NotificationsService.onReadingCreated()` **sin bloquear** el registro (catch + log); `BpReadingsModule` importa `NotificationsModule`. Verificación: crear una lectura >140/90 envía email y la lectura se guarda aunque el SMTP falle.
7. **Reportes**: `notifications-report.service.ts` con el resumen (nº lecturas, promedios, distribución por categoría, crisis, comparación con el periodo anterior) y el PDF con pdfkit; `report-summary.util.spec.ts`. Verificación: el email llega con HTML y adjunto legibles.
8. **Cron y trigger dev**: `ScheduleModule.forRoot()` en `app.module.ts`, `notifications-scheduler.service.ts` con `@Cron(EVERY_MINUTE)`, `@nestjs/schedule` en `package.json` y `notifications-dev.controller.ts` (`POST /notifications/dev/run`, 404 en producción). Verificación: el trigger envía recordatorio/reporte y escribe la entrega.
9. **Capa portable front**: `lib/notifications/core/**` + `notifications.api.ts` + `dal.ts`. Verificación: `tsc` y `grep` de imports prohibidos en `core`.
10. **Switch accesible**: `components/ui/switch.tsx` controlado (`role="switch"`, label, descripción, `disabled`). Verificación: teclado y lector de pantalla; el mockup se ve igual.
11. **Bloques de la vista**: `components/settings/notifications/{reminders,medical-alerts,reports,channels}-card.tsx` + cabecera con "Guardar Cambios". Campos condicionales: segunda hora en "dos veces al día", día en "semanal". Verificación: los cuatro bloques renderizan y las condicionales aparecen/desaparecen.
12. **Hook y página**: `use-notification-preferences-form.ts` (dirty, PATCH, toast, error raíz, timezone) y `app/(dashboard)/dashboard/settings/notifications/page.tsx` como Server Component delgado que resuelve sesión + preferencias y monta la vista. Verificación: guardar, recargar y ver los valores persistidos.
13. **Sección disponible**: `lib/settings/core/sections.ts` pasa `notifications` a `available`. Verificación: la sub-nav ya no muestra "Disponible próximamente".
14. **Cierre**: a11y, responsive 375/1440, copy español, `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build` en ambos repos, Playwright del flujo completo y comprobación de emails en Mailtrap.

## Criterios de aceptación

- [ ] `/dashboard/settings/notifications` muestra los cuatro bloques del mockup y ya no muestra "Disponible próximamente".
- [ ] El ítem "Notificaciones" de la sub-nav queda `aria-current="page"` y sin la nota de próximamente.
- [ ] Un usuario sin fila de preferencias recibe defaults al abrir la sección y se crea su fila en `notification_preferences`.
- [ ] "Guardar Cambios" está deshabilitado sin cambios, se habilita al tocar cualquier control y en un solo `PATCH` persiste todo.
- [ ] Al recargar la página se ven los valores guardados y el botón vuelve a estar deshabilitado.
- [ ] Guardar muestra un toast de éxito; un fallo muestra el error de la API y no pierde los valores del formulario.
- [ ] Con frecuencia "Dos veces al día" aparece y se exige la segunda hora; con "Semanal" aparece y se exige el día de la semana; en "Diario" ambos campos desaparecen y no se envían.
- [ ] La zona horaria IANA del navegador se envía al guardar; una zona inválida se rechaza con 400.
- [ ] Si el canal Email está apagado, "Por email" y los toggles dependientes quedan deshabilitados con nota, y no se envía ningún correo.
- [ ] Push y En la App se pueden activar/desactivar, se persisten y muestran la nota "Disponible próximamente".
- [ ] Un recordatorio diario se envía a la hora local configurada solo si no hay lecturas ese día; si ya hay una, no se envía.
- [ ] "Dos veces al día" envía como máximo dos emails al día y el segundo solo si no hubo lectura desde el primero.
- [ ] Un recordatorio semanal se envía el día elegido a la hora elegida y solo si no hubo lecturas en 7 días.
- [ ] Cambiar la zona horaria del usuario desplaza la hora real del envío (verificado con dos zonas distintas).
- [ ] Registrar una lectura >140/90 con `alertHighEnabled` envía un email inmediato; con el toggle apagado no lo envía.
- [ ] Registrar una lectura <90/60 o con `irregularHeartBeat` respeta sus toggles correspondientes.
- [ ] Una lectura con categoría de crisis que no cruce los umbrales configurados no envía email si esos toggles están apagados.
- [ ] Si el envío del email de alerta falla, la lectura se guarda igual y el fallo queda en `notification_deliveries` con `status = FAILED`.
- [ ] El reporte semanal se envía el lunes a las 08:00 locales y cubre la semana anterior completa.
- [ ] El reporte mensual se envía el día 1 a las 08:00 locales y cubre el mes anterior completo.
- [ ] El reporte llega con resumen HTML y PDF adjunto con nombre `tensi-reporte-{semanal|mensual}-{periodo}.pdf`.
- [ ] Un mismo periodo no genera dos entregas para el mismo usuario, tipo y canal, aunque el job se ejecute dos veces.
- [ ] `POST /notifications/dev/run` dispara los jobs a demanda en desarrollo y devuelve un resumen; en producción responde 404.
- [ ] Los unit tests de `local-time.util`, `due-notifications` y `report-summary.util` pasan, incluido el caso DST.
- [ ] `lib/notifications/core/**` no importa `next/*`, `server-only` ni usa `window`/`document`/`localStorage`.
- [ ] Ningún componente de `components/settings/notifications/**` tiene estado propio: todo vive en `lib/notifications/hooks/**`.
- [ ] No se añade ningún `<a>`; los props son `Readonly<>` y las clases son canónicas (`pnpm lint` limpio).
- [ ] La sección es usable a 375 px y 1440 px sin scroll horizontal ni errores de consola.
- [ ] `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build` pasan en `next-tensi-web`; `pnpm lint`, `pnpm build` y `pnpm test` pasan en `nest-tensi-api`.

## Decisiones

- **Sí:** front + back real. Persistir preferencias sin enviar nada habría dejado la sección igual de decorativa que el placeholder de SPEC 18.
- **Sí:** Push web diferido. Requiere service worker, VAPID y permisos; merece su propia spec.
- **Sí:** Email como canal maestro. Si está apagado no sale ningún correo y los toggles dependientes se deshabilitan; si está encendido, "Por email" decide el reporte.
- **Sí:** "En la App" y Push se guardan como preferencia con nota honesta. No hay campana ni bandeja que los consuma todavía.
- **Sí:** ambos planes ven y usan todo. No hay mockup Free y no se pone un muro de pago sobre salud.
- **Sí:** zona horaria IANA por usuario, capturada del navegador y validada en el back; sin ella, "09:00" no significa nada.
- **Sí:** `date-fns` + `date-fns-tz`. Implementar el cálculo de zonas y DST a mano con `Intl` es una fuente de bugs silenciosos.
- **Sí:** recordatorios solo si no hay lectura en la ventana. Evita spam y refuerza el hábito.
- **Sí:** alerta médica por email inmediata al registrar, en modo fire-and-forget. Un fallo de SMTP no puede tumbar el registro de una lectura.
- **Sí:** umbrales literales del mockup (>140/90, <90/60, `irregularHeartBeat`), no las categorías WHO. Así el texto del toggle coincide con el comportamiento.
- **Sí:** reportes de periodo cerrado (semana/mes anterior) a las 08:00 locales del lunes/día 1. El mockup no permite configurar día ni hora.
- **Sí:** PDF con resumen nuevo y pdfkit, no el PDF clínico de exportación existente (lista todas las lecturas y no es un resumen).
- **Sí:** `NotificationDelivery` con unique por periodo. Una sola tentativa por periodo, sin reintentos automáticos, para no duplicar ni spamear.
- **Sí:** trigger dev autenticado y deshabilitado en producción. Permite verificar con Mailtrap sin esperar horas.
- **Sí:** unit tests de helpers puros; sin e2e ni base de datos de prueba.
- **No:** UI para programar día/hora de reportes.
- **No:** bandeja in-app, push real, gating premium, reintentos, gráficas en el PDF.
- **No:** cambios en el diálogo de emergencia existente al registrar lecturas.

## Riesgos

| Riesgo                                                | Mitigación                                                                                              |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Varias instancias del back ejecutan el cron a la vez  | Unique `(userId, type, periodKey, channel)`: solo una inserción gana. SPEC 19 despliega una instancia.  |
| Escanear todas las preferencias cada minuto           | Se filtran filas con recordatorios o reportes activos; índice por `userId` y volumen actual pequeño.    |
| SMTP de Mailtrap no entrega en producción             | El proveedor se cambia por variables `MAIL_*`; la spec no toca `MailService` más allá de añadir emails. |
| Cambio de horario (DST) desplaza los envíos           | `date-fns-tz` + unit test explícito de DST.                                                             |
| Un fallo de correo bloquea el registro de una lectura | Llamada fire-and-forget con catch; la lectura ya está persistida antes del envío.                       |
| El usuario OAuth puro no tiene email                  | `email` es nullable: el canal Email se deshabilita con nota y no se intenta enviar.                     |
| El usuario pierde cambios al navegar con el dirty     | El botón y el toast dejan claro el estado; no se añade bloqueo de navegación en esta spec.              |
| PDF grande o lento                                    | Resumen de texto y tablas simples, sin gráficas; generación en memoria con pdfkit.                      |
| Correos con HTML mal escapado                         | Escapar nombre y notas del usuario antes de interpolarlos (SPEC 09).                                    |

## Qué **no** entra en esta spec

- Push web (service worker, VAPID, suscripciones).
- Bandeja de notificaciones in-app y campana del header.
- Configuración de día/hora de los reportes desde la UI.
- Gating Free/Premium de notificaciones.
- Reintentos automáticos y cola de mensajes.
- Reportes con gráficas o el PDF clínico completo.
- Tests e2e con base de datos real.

Cada uno, si se implementa, va en su propia spec.
