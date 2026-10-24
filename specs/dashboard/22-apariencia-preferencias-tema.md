# SPEC 22 — Apariencia: preferencias de tema e interfaz

> **Status:** Aprobado
> **Depends on:** SPEC 06, SPEC 09, SPEC 11, SPEC 14, SPEC 17, SPEC 18, SPEC 20, SPEC 21
> **Date:** 2026-10-23
> **Objective:** Implementar la sección Apariencia de Configuración con sus cuatro bloques, persistir tema, acento, contraste, motion, densidad, idioma y formato de fecha en Nest, y aplicar los cambios con preview inmediato y "Guardar Cambios" mediante la cookie espejo definida en SPEC 21.

## Por qué existe esta spec

- SPEC 18 dejó `/dashboard/settings/appearance` como `ComingSoonSection`. El mockup `references/dashboard/04-profile-premium/apariencia/` define los cuatro bloques que faltan: Tema de la Aplicación, Idioma y Región, Esquema de Colores y Configuraciones Avanzadas, con "Guardar Cambios" en la cabecera.
- SPEC 21 construyó el sistema que hace posible el tema claro/oscuro, los cuatro acentos, el alto contraste, el motion reducido y la densidad compacta, y definió la cookie `tensi_appearance`, pero **no hay forma de configurarlos** desde la UI ni de persistirlos.
- `nest-tensi-api` no tiene ninguna preferencia de apariencia: solo existe `NotificationPreference` (SPEC 20). Sin un modelo 1:1 con `User`, el tema no se sincroniza entre dispositivos ni sobrevive a un cambio de navegador.
- El mockup marca "Automático" y el esquema de colores como "próximamente". Se decidió implementar ambos: el sistema de SPEC 21 ya soporta `auto` vía `prefers-color-scheme` y el acento real vía `data-accent`.
- El mockup muestra el estado Premium, pero no existe un diseño Free de esta sección. Se decidió que **ambos planes vean y usen todo igual**, sin gating.
- Se decidió **preview inmediato + guardado explícito**: los controles aplican el cambio al instante y "Guardar Cambios" persiste todo en un único `PATCH`. Salir sin guardar deja la preview hasta recargar; la cookie solo se escribe al guardar.

## Alcance

**In:**

- **Sección Apariencia** en `/dashboard/settings/appearance` con los cuatro bloques del mockup:
  - **Tema de la Aplicación**: Claro, Oscuro y Automático como grupo de radios.
  - **Idioma y Región**: idioma de la interfaz (Español activo, English deshabilitado con nota) y formato de fecha derivado del idioma (deshabilitado, con texto de ayuda).
  - **Esquema de Colores**: Azul, Verde, Morado y Rojo como grupo de radios; sin el banner de "futura actualización" del mockup porque el acento sí se implementa.
  - **Configuraciones Avanzadas**: Modo compacto, Animaciones y Alto contraste con el `Switch` de SPEC 20.
- **Cabecera con "Guardar Cambios"**: deshabilitado sin cambios, habilitado al tocar cualquier control, estado pendiente y toast de éxito/error.
- **Preview inmediato** de tema, acento, contraste, motion y densidad usando `use-appearance-attributes` de SPEC 21.
- **Modelo `AppearancePreference`** 1:1 con `User` en Prisma, con enums para tema, acento, contraste, motion, densidad, idioma y formato de fecha.
- **Endpoints** `GET` y `PATCH /appearance/preferences` con DTOs validados, mapper y documentación Swagger.
- **Capa portable** `lib/appearance/core/**` (tipos, esquemas zod, opciones/labels, defaults y derivación del formato de fecha), `appearance.api.ts` y `dal.ts`.
- **Cookie espejo** `tensi_appearance` (definida en SPEC 21): se escribe tras un `PATCH` exitoso, al iniciar sesión con email/contraseña y desde el dashboard cuando falta; se limpia al cerrar sesión.
- **Sincronización del dashboard** cuando falta la cookie (primer login con OAuth o dispositivo nuevo): el layout resuelve las preferencias y un `AppearanceSync` las aplica y escribe la cookie.
- **Sección disponible** en `lib/settings/core/sections.ts` (`appearance` pasa de `coming-soon` a `available`).
- **Accesibilidad (SPEC 06)**: grupos de radios nativos con `fieldset`/`legend`, labels asociados, `aria-describedby` para ayudas, errores con `role="alert"`, foco visible y responsive 375/1440.
- **Tests unitarios del back** para el mapper y el get-or-create de defaults.

**Out of scope (para specs futuras):**

- **i18n real**: traducción de la interfaz, cambio efectivo de idioma y formateo de fechas/números por locale. English se persiste pero la UI sigue en español.
- **Sincronización entre pestañas** en vivo (`storage`/BroadcastChannel). Los cambios se ven al recargar o al navegar con la cookie ya escrita.
- **Toggle rápido de tema** en el header del dashboard.
- **Gating Free/Premium** de la sección o de alguna de sus opciones.
- **Exportar/importar** preferencias.
- **Tema por dispositivo**: la preferencia es por usuario, no por navegador.
- **Tests e2e con base de datos real**.

## Modelo de datos

### Prisma (back)

```prisma
enum AppearanceTheme {
  DARK
  LIGHT
  AUTO
}

enum AppearanceAccent {
  BLUE
  GREEN
  PURPLE
  RED
}

enum AppearanceContrast {
  NORMAL
  HIGH
}

enum AppearanceMotion {
  FULL
  REDUCED
}

enum AppearanceDensity {
  COMFORTABLE
  COMPACT
}

enum AppearanceLanguage {
  ES
  EN
}

enum AppearanceDateFormat {
  DD_MM_YYYY
  MM_DD_YYYY
}

model AppearancePreference {
  id     String @id @default(uuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  theme      AppearanceTheme      @default(DARK)
  accent     AppearanceAccent     @default(BLUE)
  contrast   AppearanceContrast   @default(NORMAL)
  motion     AppearanceMotion     @default(FULL)
  density    AppearanceDensity    @default(COMFORTABLE)
  language   AppearanceLanguage   @default(ES)
  dateFormat AppearanceDateFormat @default(DD_MM_YYYY)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("appearance_preferences")
}
```

`User` gana la relación `appearancePreferences AppearancePreference?`.

### Contrato de la API

La API usa valores en minúscula, iguales a los atributos CSS y a los tipos portables de SPEC 21; el mapper traduce a los enums de Prisma.

```ts
export interface AppearancePreferences {
  theme: "dark" | "light" | "auto"
  accent: "blue" | "green" | "purple" | "red"
  contrast: "normal" | "high"
  motion: "full" | "reduced"
  density: "comfortable" | "compact"
  language: "es" | "en"
  dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY"
}

// GET /appearance/preferences → { preferences }
//   Si el usuario no tiene fila, se crea con los defaults.
// PATCH /appearance/preferences { ...campos parciales } → { message, preferences }
//   401 sin sesión; 400 si un enum no es válido.
```

Validaciones del `PATCH` (class-validator + zod espejo en el front):

- Todos los campos son opcionales; se actualizan solo los enviados.
- `theme`, `accent`, `contrast`, `motion`, `density`, `language` y `dateFormat` se validan con `@IsEnum`.
- `dateFormat` debe ser coherente con `language`: `es` → `DD/MM/YYYY`, `en` → `MM/DD/YYYY`. Si llega un `dateFormat` incoherente, el servicio lo deriva del idioma efectivo (el enviado o el guardado).
- Un `PATCH` vacío es válido y no cambia nada.

### Cookie espejo

Definida en SPEC 21 (`lib/theme/core/appearance.ts`):

- Nombre: `tensi_appearance`.
- Contenido: solo los cinco valores visuales (`theme`, `accent`, `contrast`, `motion`, `density`), serializados como `theme=light&accent=green&…`.
- Atributos: `Path=/`, `SameSite=Lax`, `Max-Age=31536000`, no `HttpOnly`, `Secure` solo en HTTPS.
- Se escribe: tras un `PATCH` exitoso, al completar login con email/contraseña, y desde `AppearanceSync` cuando falta.
- Se limpia: al cerrar sesión.
- `language` y `dateFormat` no van en la cookie: no afectan al pintado.

### Archivos front

```ts
// lib/appearance/core/types.ts          → AppearancePreferences, AppearanceFormValues
// lib/appearance/core/schemas.ts        → zod con los enums del contrato
// lib/appearance/core/preferences.ts    → defaults, opciones/labels, deriveDateFormat(language)
// lib/appearance/appearance.api.ts      → getAppearancePreferences / updateAppearancePreferences
// lib/appearance/dal.ts                 → server-only, reenvía la cookie (patrón de lib/notifications/dal.ts)
// lib/appearance/hooks/use-appearance-form.ts → RHF + preview + PATCH + toast + cookie
// lib/theme/appearance-cookie.ts        → writeAppearanceCookie / clearAppearanceCookie (usa document)
// lib/theme/hooks/use-appearance-sync.ts → aplica valores y escribe la cookie si falta
```

`lib/appearance/core/**` no puede importar Next ni usar `window`, `document` o `localStorage` (guard de SPEC 17). La escritura de la cookie vive en `lib/theme/appearance-cookie.ts` (capa web) y se invoca desde hooks.

### Copy y desviaciones del mockup

- Tema: subtítulo "Elige entre tema claro, oscuro o automático **según la configuración de tu sistema**" (el mockup dice "según la hora del día", pero `auto` sigue `prefers-color-scheme`, no la hora).
- Automático: opción activa, sin `opacity-60` ni "Próximamente...". Descripción: "Sigue el tema de tu sistema".
- English: opción visible y deshabilitada con la nota "Disponible próximamente".
- Formato de fecha: deshabilitado, valor derivado del idioma y ayuda "Se establece automáticamente según el idioma".
- Esquema de Colores: se elimina el banner "Los esquemas de color personalizados estarán disponibles en una futura actualización" porque el acento es real.
- El resto del copy se mantiene en español y fiel al mockup.

## Plan de implementación

1. **Modelo y migración** en `nest-tensi-api`: enums, `AppearancePreference`, relación en `User` y migración Prisma. Verificación: `pnpm prisma generate` y migración aplicada en local; la tabla `appearance_preferences` existe.
2. **Módulo y endpoints**: `src/appearance/appearance.module.ts`, `appearance.controller.ts`, `appearance.service.ts` (`getOrCreatePreferences`, `updatePreferences`), DTOs con `@IsEnum`, response DTO, mapper y `AppModule`. Verificación: `GET` crea defaults; `PATCH` parcial actualiza; enum inválido → 400; sin sesión → 401; Swagger muestra los enums.
3. **Tests del back**: `appearance.service.spec.ts` y `appearance.mapper.spec.ts` con Prisma mockeado (defaults, actualización parcial, derivación de `dateFormat`). Verificación: `pnpm test appearance`.
4. **Capa portable y API**: `lib/appearance/core/{types,schemas,preferences}.ts`, `appearance.api.ts` y `dal.ts`. Verificación: `pnpm exec tsc --noEmit`; `grep` de imports prohibidos en `core`.
5. **Cookie espejo**: `lib/theme/appearance-cookie.ts` con `writeAppearanceCookie` y `clearAppearanceCookie` usando `serializeAppearanceCookie` de SPEC 21. Verificación: escribir la cookie a mano y recargar cambia el tema.
6. **UI de los cuatro bloques**: `components/settings/appearance/` con `appearance-view.tsx`, `appearance-header.tsx`, `theme-section.tsx`, `language-region-section.tsx`, `color-scheme-section.tsx` y `advanced-section.tsx`. Radios nativos para tema y acento, `Switch` para los toggles, selects con labels. Verificación: render de los cuatro bloques y navegación por teclado.
7. **Hook del formulario**: `use-appearance-form.ts` con RHF + zod, dirty state, preview vía `use-appearance-attributes`, un `PATCH`, toast de éxito, error raíz, botón pendiente y escritura de la cookie tras el guardado. Verificación: cambiar tema/acento/toggles se ve al instante; guardar persiste; recargar mantiene.
8. **Página y sección disponible**: `app/(dashboard)/dashboard/settings/appearance/page.tsx` como Server Component delgado (`verifySession` + `getAppearancePreferencesForSession` → vista) y `sections.ts` con `appearance: "available"`. Verificación: la sub-nav marca la sección y ya no muestra "Disponible próximamente".
9. **Sincronización al iniciar sesión**: en `lib/auth/hooks/use-auth.ts`, tras el login con email/contraseña, pedir las preferencias y escribir la cookie antes de `router.push("/dashboard")` (fallo no bloqueante). Verificación: tras login, la primera pintura del dashboard ya tiene el tema guardado.
10. **Sincronización del dashboard**: en el layout autenticado, si falta la cookie, resolver las preferencias (memoizado) y montar `AppearanceSync` (`lib/theme/hooks/use-appearance-sync.ts`), que aplica los atributos y escribe la cookie. Verificación: con sesión y sin cookie (OAuth/dispositivo nuevo) el dashboard adopta el tema guardado y la siguiente carga ya no hace la llamada.
11. **Cierre de sesión**: limpiar `tensi_appearance` en `use-logout` antes de redirigir. Verificación: tras cerrar sesión, `/login` vuelve al tema por defecto del sistema.
12. **Cierre**: a11y (grupos, foco, errores, contraste), responsive 375/1440, copy español, Playwright del flujo completo (preview, guardar, recargar, error de API, login/logout, OAuth sin cookie), `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build` en `next-tensi-web`; `pnpm lint`, `pnpm build` y `pnpm test` en `nest-tensi-api`.

## Criterios de aceptación

- [ ] `/dashboard/settings/appearance` muestra los cuatro bloques del mockup y ya no muestra "Disponible próximamente".
- [ ] El ítem "Apariencia" de la sub-nav queda `aria-current="page"` y sin la nota de próximamente.
- [ ] Un usuario sin fila recibe defaults al abrir la sección (`dark`, `blue`, `normal`, `full`, `comfortable`, `es`, `DD/MM/YYYY`) y se crea su fila en `appearance_preferences`.
- [ ] "Guardar Cambios" está deshabilitado sin cambios, se habilita al tocar cualquier control y en un solo `PATCH` persiste todos los campos.
- [ ] Al recargar se ven los valores guardados y el botón vuelve a estar deshabilitado.
- [ ] Guardar muestra un toast de éxito; un fallo muestra el mensaje de la API, conserva los valores del formulario y no escribe la cookie.
- [ ] Elegir Claro, Oscuro o Automático aplica el tema al instante en toda la app (dashboard, auth y landing) antes de guardar.
- [ ] Automático sigue `prefers-color-scheme` y reacciona a un cambio del tema del sistema sin recargar.
- [ ] Elegir Verde, Morado o Rojo cambia al instante botones, enlaces, foco, ítem activo del sidebar y switches; Azul vuelve a la identidad actual.
- [ ] "Alto contraste" refuerza textos y bordes al instante y el resultado pasa axe sin violaciones serias.
- [ ] "Animaciones" apagado desactiva transiciones y animaciones al instante; encendido las restaura.
- [ ] "Modo compacto" reduce padding y separación del contenido del dashboard al instante, sin encoger fuentes ni iconos.
- [ ] El select de idioma muestra Español seleccionado y English deshabilitado con la nota "Disponible próximamente"; guardar persiste `es`.
- [ ] El select de formato de fecha muestra el valor derivado (`DD/MM/AAAA`), está deshabilitado y guarda `DD/MM/YYYY`.
- [ ] Si se sale de la sección sin guardar, la preview sigue hasta recargar; al recargar vuelven los valores persistidos y la cookie no cambió.
- [ ] La cookie `tensi_appearance` solo se escribe tras un `PATCH` exitoso (o al sincronizar) y contiene los cinco valores visuales; `language` y `dateFormat` no van en ella.
- [ ] Tras login con email/contraseña, el dashboard se pinta con el tema guardado desde la primera pintura.
- [ ] Con OAuth o dispositivo nuevo sin cookie, el dashboard aplica el tema guardado y escribe la cookie; la siguiente carga ya no consulta las preferencias para pintar.
- [ ] Cerrar sesión limpia `tensi_appearance` y `/login` usa el tema por defecto del sistema.
- [ ] Free y Premium ven y usan exactamente los mismos controles, sin candados ni CTA de upgrade.
- [ ] Los grupos de tema y acento se navegan con las flechas del teclado; los switches con espacio; los selects con teclado; el foco es visible en todos.
- [ ] Los grupos tienen nombre accesible (`fieldset`/`legend`), las ayudas están asociadas con `aria-describedby` y el error de guardado se anuncia con `role="alert"`.
- [ ] La sección es usable a 375 px y 1440 px sin scroll horizontal ni errores de consola, en claro y oscuro.
- [ ] `lib/appearance/core/**` no importa `next/*`, `server-only` ni usa `window`/`document`/`localStorage`.
- [ ] Ningún componente de `components/settings/appearance/**` tiene estado propio: todo vive en `lib/appearance/hooks/**` y `lib/theme/hooks/**`.
- [ ] No se añade ningún `<a>`; los props son `Readonly<>` y las clases son canónicas (`pnpm lint` limpio).
- [ ] `GET /appearance/preferences` devuelve defaults sin fila; `PATCH` con enum inválido devuelve 400; sin sesión devuelve 401; Swagger documenta ambos endpoints y los enums.
- [ ] Los tests unitarios del mapper y del servicio pasan (`pnpm test appearance`).
- [ ] `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build` pasan en `next-tensi-web`; `pnpm lint`, `pnpm build` y `pnpm test` pasan en `nest-tensi-api`.

## Decisiones

- **Sí:** front + back real. Guardar la preferencia solo en el navegador no sincroniza dispositivos y deja la sección a medias, como el placeholder de SPEC 18.
- **Sí:** una tabla tipada 1:1 (`AppearancePreference`) en vez de un key-value genérico de preferencias. Los enums validan en base de datos y el contrato es explícito.
- **Sí:** API en minúscula (`"light"`, `"green"`) y enums de Prisma en mayúscula, con mapper. Así el front reutiliza los mismos valores que los atributos CSS de SPEC 21 y no hay dos vocabularios.
- **Sí:** cookie espejo no `HttpOnly`. Es el mecanismo que permite el anti-FOUC de SPEC 21; solo contiene valores cosméticos y se valida al parsear.
- **Sí:** preview inmediato + guardado explícito. El usuario ve el resultado antes de comprometerlo y "Guardar Cambios" mantiene el patrón de SPEC 20 (dirty state, un solo `PATCH`).
- **Sí:** la preview sobrevive a la navegación hasta recargar. La cookie solo se escribe al guardar, así que recargar es el punto de retorno claro.
- **Sí:** Automático real. `prefers-color-scheme` ya es el fallback de las páginas públicas en SPEC 21; dejarlo deshabilitado sería incoherente.
- **Sí:** el acento real y se elimina el banner de "futura actualización" del mockup. Mantener un aviso de "no disponible" sobre algo que funciona sería mentir al usuario.
- **Sí:** idioma y formato de fecha se persisten aunque English no funcione. Deja la sección completa y evita otra migración cuando llegue el i18n; el formato se deriva del idioma.
- **Sí:** ambos planes igual. No hay mockup Free y no se pone un muro de pago sobre accesibilidad o preferencias visuales.
- **Sí:** limpiar la cookie al cerrar sesión. Evita que el siguiente usuario de un dispositivo compartido herede el tema del anterior.
- **Sí:** sincronizar el dashboard solo cuando falta la cookie. Evita un `GET` extra en cada carga para quienes ya la tienen.
- **No:** i18n real, traducción o formateo por locale.
- **No:** sincronización entre pestañas en vivo.
- **No:** gating premium, toggle en el header, export/import.
- **No:** cambios en el diálogo de emergencia ni en otras secciones.

## Riesgos

| Riesgo                                                                 | Mitigación                                                                                                         |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Flash de tema en el primer login con OAuth (no hay handler en Next)    | `AppearanceSync` aplica la preferencia y escribe la cookie; las cargas siguientes ya pintan bien desde el script.  |
| La cookie queda desfasada respecto a la base de datos                  | Se reescribe en cada guardado y en cada login; el dashboard la corrige cuando falta. Se documenta como limitación. |
| El usuario manipula la cookie                                          | `parseAppearanceCookie` valida cada enum y cae al default; solo afecta a lo cosmético, nunca a datos ni permisos.  |
| `PATCH` exitoso pero escritura de cookie fallida (modo privado)        | La cookie queda ausente; la siguiente carga del dashboard resuelve desde la base de datos y reintenta.             |
| Un `GET` extra en cada carga dura del dashboard cuando falta la cookie | Solo ocurre sin cookie (primer login/dispositivo nuevo); luego se escribe y se deja de llamar.                     |
| El acento elegido no alcanza contraste AA sobre `accent`               | `--color-accent-fg` se define por acento y tema; axe se ejecuta con los cuatro acentos.                            |
| `dateFormat` guardado no coincide con el idioma                        | El servicio lo deriva del idioma efectivo y el front lo muestra deshabilitado; no se puede editar a mano.          |
| La migración Prisma choca con datos existentes                         | Tabla nueva 1:1 sin backfill obligatorio; `getOrCreate` crea la fila al primer acceso.                             |
| Cambios sin guardar se pierden al recargar                             | Es el comportamiento acordado; el botón dirty y el toast dejan claro cuándo se persistió.                          |
| La sección se degrada en móvil por los cuatro bloques                  | Grid de una columna a 375 px y dos columnas del shell desde `md`; verificación con Playwright en ambos anchos.     |

## Qué **no** entra en esta spec

- Traducción real de la interfaz y cambio efectivo de idioma.
- Formateo de fechas/números dependiente del locale en toda la app.
- Sincronización en vivo entre pestañas.
- Gating Free/Premium de la sección o de sus opciones.
- Toggle rápido de tema en el header.
- Exportar/importar preferencias o tema por dispositivo.
- Tests e2e con base de datos real.

Cada uno, si se implementa, va en su propia spec.
