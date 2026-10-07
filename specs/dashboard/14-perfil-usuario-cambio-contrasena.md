# SPEC 14 — Perfil de usuario y cambio de contraseña

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 03, SPEC 05, SPEC 06, SPEC 07, SPEC 11
> **Date:** 2026-10-06
> **Objective:** Implementar la pantalla Perfil (`/dashboard/profile`) con edición de datos personales y avatar, y la pestaña de cambio de contraseña bloqueada para cuentas OAuth, extendiendo `check-token` para exponer el perfil de la sesión.

## Por qué existe esta spec

- El ítem "Configuración" del sidebar es un placeholder (`lib/dashboard/nav.ts:75-80`, `components/dashboard/dashboard-sidebar.tsx:71`); no existe pantalla de perfil.
- El back ya tiene `PATCH /users/profile` (multipart + Cloudinary, máx 1 MB) y `POST /users/profiles/update-password` (rechaza con 400 a cuentas sin `password`), pero el front no los consume.
- `GET /auth/check-token` (`src/auth/auth.service.ts:170-198`) solo devuelve `{ id, username, email, plan }`: sin campos de perfil ni señal de OAuth la página no puede pre-rellenar el formulario ni bloquear la contraseña.
- El `HttpClient` del front solo serializa JSON (`lib/http/fetch-client.ts:124-128`); el upload de avatar obliga a soportar `FormData`.
- OAuth (Google/GitHub) existe en el back (`src/auth/strategies/*`) pero no en el front: los botones sociales siguen "Próximamente" (SPEC 01). Por eso la detección social debe salir de la sesión, no de un login social.

## Alcance

**In:**

- **Back (`nest-tensi-api`)**:
  - `AuthService.checkToken` devuelve el perfil completo del usuario más `hasPassword: boolean` y `providers: ("google" | "github")[]`; sin endpoints nuevos.
  - `UpdateProfileDto.medications` normaliza un valor único a array (una sola medicación por multipart llega como `string` y hoy rompería `@IsArray`).
- **Front (`next-tensi-web`)**:
  - `lib/http`: `fetch-client` acepta `FormData` (no lo `JSON.stringify` ni fija `Content-Type`); el resto del contrato `HttpClient` no cambia.
  - `lib/auth/types.ts`: `AuthUser` crece con los campos de perfil y el estado social (`hasPassword`, `providers`).
  - Dominio nuevo `lib/profile/`: tipos, api, constantes de medicamentos, helpers puros, schemas zod y hooks.
  - `lib/dashboard/nav.ts`: `DASHBOARD_SETTINGS_ITEM.href = "/dashboard/profile"`; `getActiveNavId` contempla también el ítem de Configuración.
  - Ruta `app/(dashboard)/dashboard/profile/page.tsx` (Server Component, `metadata.title = "Perfil"`).
  - Componentes `components/profile/*` (tabs, formulario de perfil, selector de medicamentos, avatar) y `components/form/select-field.tsx`.
  - Pestañas Perfil / Cambiar Contraseña con estado local en un hook y patrón ARIA de tabs.
  - Feedback al guardar: toast global + `setUser` en `AuthProvider` + `router.refresh()` (el header refleja el cambio).
  - `components/dashboard/user-profile.tsx` muestra `avatarUrl` cuando existe (fallback a iniciales).
- **Accesibilidad** SPEC 06 (tabs ARIA, labels, foco, `aria-invalid`/`role="alert"`, anuncios), convenciones SPEC 11 (todo el estado en `lib/**/hooks/**`), SPEC 07 (`next/link`), props `Readonly<>` y clases canónicas.
- **Responsive** 375 px / 1440 px sin scroll horizontal ni errores de consola.

**Out of scope (para specs futuras):**

- **El flujo de login/registro OAuth (Google/GitHub)** va en su propia spec. Aquí no se implementa ni se activan los botones sociales.
- Cambio de correo electrónico (el back no lo permite).
- Campo `bio` (el back lo acepta, pero el mockup no lo muestra).
- Eliminar cuenta, preferencias/notificaciones y tema claro/oscuro.
- Reportes PDF y demás pantallas del sidebar.
- Tests automatizados (el repo no tiene runner) y CSRF.

> Nota de alcance: el candado de la pestaña de contraseña para cuentas sin contraseña local **sí entra** en esta spec, como guarda. Es la única pieza del eje OAuth que se conserva; el flujo social completo queda fuera.

## Modelo de datos

No hay modelos de base de datos nuevos. El único cambio de contrato es la respuesta de `check-token`.

`GET /api/auth/check-token` → `{ user }`:

```ts
export type Plan = "FREE" | "PREMIUM"
export type Gender = "MALE" | "FEMALE" | "OTHER"
export type OAuthProvider = "google" | "github"

/** Campos de perfil que comparten la sesión y la respuesta de actualización. */
export interface ProfileFields {
  id: string
  username: string
  email: string | null
  plan: Plan
  birthDate: string | null // ISO; la UI lo recorta a yyyy-mm-dd
  weight: number | null // kg
  height: number | null // metros (como lo guarda el back)
  gender: Gender | null
  medications: string[]
  avatarUrl: string | null
  bio: string | null
}

export interface AuthUser extends ProfileFields {
  /** `false` cuando la cuenta no tiene contraseña local (OAuth puro). */
  hasPassword: boolean
  providers: OAuthProvider[]
}
```

`PATCH /users/profile` (multipart/form-data) → `{ message, user: ProfileFields }`:

```ts
export interface UpdateProfileInput {
  username: string
  birthDate?: string // yyyy-mm-dd
  gender?: Gender
  weight?: number // kg
  height?: number // cm (el front convierte a metros antes de enviar)
  medications?: string[]
  avatar?: File
}

export interface UpdateProfileResponse {
  message: string
  user: ProfileFields
}
```

`POST /users/profiles/update-password` (JSON) → `{ message, user: ProfileFields }`:

```ts
export interface UpdatePasswordInput {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

export interface UpdatePasswordResponse {
  message: string
  user: ProfileFields
}
```

Constantes de presentación (`lib/profile/medications.ts`):

```ts
export interface MedicationGroup {
  id: string
  label: string
  medications: readonly string[]
}

export const MEDICATION_GROUPS: readonly MedicationGroup[]
```

Cinco grupos como el mockup, sin el grupo vacío "Vasodilatadores": Diuréticos, Betabloqueadores, IECA (Inhibidores ECA), ARA-II (Antagonistas de Angiotensina II) y Calcioantagonistas (24 fármacos en total).

Helpers puros (`lib/profile/format.ts`): `parseMedicationInput(value)` (separa por comas, recorta, deduplica y descarta vacíos), `divideBy100(value)`/`times100(value)` (cm↔m redondeados a 1 decimal), `toDateInputValue(iso)` y `toDateISO(value)`, `normalizeMedications(medications, groups)` (separa las conocidas de las "Otros").

Schemas zod (`lib/profile/schemas.ts`): `profileSchema` (username mín. 2 como el back; opcionales birthDate, gender `MALE|FEMALE|OTHER`, weight > 0 en kg, height > 0 en cm, `medications: string[]`) y `passwordChangeSchema` (currentPassword, newPassword con la política de la app —mín. 6, 1 mayúscula, 1 minúscula, 1 número—, confirmNewPassword y `refine` de coincidencia). La política de contraseña se extrae a un `passwordSchema` exportado desde `lib/auth/schemas.ts` para no duplicarla.

## Plan de implementación

El orden deja el sistema funcional en cada paso. Los pasos 1–2 son en `nest-tensi-api`; el resto en `next-tensi-web`.

1. **`check-token` con perfil y estado social** (`src/auth/auth.service.ts`). En `checkToken`, además de `id/username/email/plan`, devolver `birthDate`, `weight`, `height`, `gender`, `medications`, `avatarUrl`, `bio`, `hasPassword: dbUser.password !== null` y `providers` derivados de `googleId`/`githubId`. No se filtra `password`. Verificación: `curl` con cookie devuelve los campos nuevos y sigue sin exponer `password`; `pnpm build`/`pnpm lint` del back.
2. **Normalizar medicamentos multipart** (`src/users/dto/update-profile.dto.ts`). Añadir a `medications` un `@Transform` que envuelva en array un valor único (o `undefined` si falta), para que una sola medicación pase `@IsArray`. Verificación: `PATCH /users/profile` multipart con un único `medications` responde 200 y persiste un array de un elemento.
3. **`HttpClient` con `FormData`** (`lib/http/fetch-client.ts`). Cuando `body` es `FormData`, no aplicar `JSON.stringify` ni `Content-Type` (el navegador fija el boundary). El resto de requests JSON quedan igual. Verificación: el upload de avatar llega como `multipart/form-data`; los POST JSON existentes no cambian.
4. **Tipos de sesión** (`lib/auth/types.ts`). Añadir `Gender`, `OAuthProvider`, `ProfileFields` y extender `AuthUser`. Verificación: `pnpm exec tsc --noEmit` (los consumidores actuales solo leen `id/username/email/plan`).
5. **Dominio `lib/profile/`**. Crear `types.ts` (input/response), `medications.ts` (`MEDICATION_GROUPS`), `format.ts` (helpers puros), `schemas.ts` (`profileSchema`, `passwordChangeSchema`) y exportar `passwordSchema` desde `lib/auth/schemas.ts`. Verificación: `tsc` y casos manuales de los helpers en consola.
6. **API de perfil** (`lib/profile/profile.api.ts`). `updateProfile(input, client?)` construye `FormData` (campos presentes, `medications` repetido y `avatar` si existe) contra `PATCH /users/profile`; `updatePassword(input, client?)` contra `POST /users/profiles/update-password`. Verificación: `tsc`.
7. **Hooks** (`lib/profile/hooks/`). `use-update-profile.ts` y `use-update-password.ts` (mutaciones TanStack); `use-profile-form.ts` (RHF + zod, `defaultValues` desde `AuthUser`, al éxito `setUser` + toast + `router.refresh()`, error a `setError("root")`); `use-password-form.ts`; `use-profile-tabs.ts` (pestaña activa, ids ARIA y navegación por flechas); `use-avatar-field.ts` (archivo, preview con `URL.createObjectURL`, validación tipo/tamaño y limpieza). Verificación: `pnpm lint` (SPEC 11: cero hooks vetados en componentes).
8. **Campos de formulario**. Crear `components/form/select-field.tsx` (usa `useFormField`) y añadir a `FormField` un `className` opcional (aditivo) para `[color-scheme:dark]` en fechas y estilos de número. Verificación: los campos de auth existentes no cambian.
9. **Componentes de perfil** (`components/profile/`). `profile-tabs.tsx` (tablist ARIA; la pestaña de contraseña es un botón deshabilitado con candado y nota cuando `!hasPassword`), `profile-form.tsx` (username, email deshabilitado, birthDate, gender, weight, height, `medication-picker`, `avatar-field` y "Guardar Cambios"), `password-form.tsx` (actual/nueva/confirmar, reutilizando `PasswordField`) y `medication-picker.tsx` (chips por grupo + grupo "Otros" para las personalizadas + input libre que añade al presionar Enter o coma). Todos presentacionales. Verificación: DOM de tabs, chips y estados.
10. **Ruta y navegación**. Crear `app/(dashboard)/dashboard/profile/page.tsx` (Server Component: `verifySession()`, `redirect("/login")` si no hay usuario, `<ProfileTabs user={user}>`). Actualizar `lib/dashboard/nav.ts` (`DASHBOARD_SETTINGS_ITEM.href = "/dashboard/profile"` y `getActiveNavId` incluyendo ese ítem) y `dashboard-sidebar.tsx` para resolver el ítem de Configuración con `getNavItemState`/`active`. Verificación: "Configuración" navega a `/dashboard/profile` y queda con `aria-current="page"`.
11. **Avatar en el header**. `components/dashboard/user-profile.tsx` renderiza `avatarUrl` cuando existe y cae a iniciales si no. Verificación: tras subir avatar, el header lo muestra (vía `router.refresh`).
12. **Cierre.** Repasar a11y (tabs con flechas/`aria-selected`, foco, `role="alert"`, texto del candado), copy en español, responsive 375/1440 y convenciones; `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`; Playwright del flujo completo; `git -C ../nest-tensi-api status --short` limitado a los dos archivos del back.

## Criterios de aceptación

- [x] `GET /auth/check-token` devuelve `birthDate`, `weight`, `height`, `gender`, `medications`, `avatarUrl`, `bio`, `hasPassword` y `providers`, y nunca `password`. — Evidencia: `src/auth/auth.service.ts:193-210` devuelve exactamente esos campos y no incluye `password`; el front los consume vía mock (`verify-14-mock-api.log`). E2E real contra la API no ejecutable (no hay Postgres levantado).
- [x] Una cuenta con contraseña local tiene `hasPassword: true` y `providers` vacío o con los proveedores vinculados. — Evidencia: `hasPassword: dbUser.password !== null` y `providers` derivados de `googleId`/`githubId`; mock sin cookie devuelve `hasPassword: true`, `providers: []`.
- [x] Una cuenta sin contraseña local (OAuth) tiene `hasPassword: false` y `providers` con `google`/`github`. — Evidencia: sesión simulada con cookie `mock-oauth=1` → `hasPassword: false`, `providers: ["google","github"]`.
- [x] `/dashboard/profile` con sesión válida renderiza el perfil según `references/dashboard/03-profile/screenshot.png` (cabecera de pestañas + formulario + medicamentos + avatar + "Guardar Cambios"). — Evidencia: `.playwright-mcp/verify-14-profile-1440.png` (comparado con el mockup).
- [x] El ítem "Configuración" del sidebar navega a `/dashboard/profile`, ya no es placeholder y queda con `aria-current="page"`. — Evidencia: click desde `/dashboard` navega a `/dashboard/profile`; el enlace tiene `href="/dashboard/profile"` y `aria-current="page"`.
- [x] El formulario viene pre-rellenado con username, email (deshabilitado), fecha de nacimiento, género, peso y estatura convertida a cm desde metros. — Evidencia: snapshot `.playwright-mcp/verify-14-snapshot.md` (username, email disabled, `1985-11-19`, "Masculino", 75, `175` cm desde 1.75 m).
- [x] Guardar cambios válidos llama a `PATCH /users/profile`, muestra un toast de éxito y actualiza el nombre/avatar del header sin recargar la página. — Evidencia: `PATCH /api/users/profile` multipart en `verify-14-mock-api.log`; toast "Perfil actualizado con éxito"; header actualiza nombre y avatar con la URL en `/dashboard/profile` (sin recarga).
- [x] Persistir medicamentos con **una sola** medicación por multipart guarda `medications` como array de un elemento. — Evidencia: prueba directa del DTO con class-transformer: `{ medications: "Aspirina" }` → `["Aspirina"]`, `isArray: true`, sin errores de validación; `[]`/ausente → `undefined`.
- [x] Seleccionar un chip predefinido lo añade/lo quita de `medications`; el input libre separa por comas y las medicaciones desconocidas aparecen en un grupo "Otros" removible. — Evidencia: click en "Losartán" lo añade (`aria-pressed`) y en "Enalapril" lo quita; "Omeprazol, Vitamina D" + Enter → chips removibles en "Otros".
- [x] Subir una imagen válida (JPG/PNG/WEBP ≤ 1 MB) la envía como `multipart/form-data`, la previsualiza y persiste en `avatarUrl`. — Evidencia: preview `blob:` tras elegir PNG; `PATCH` incluye `avatar` (`verify-14-avatar.png`) y el header refleja la nueva `avatarUrl`.
- [x] Un archivo inválido (tipo o > 1 MB) se rechaza en el cliente con un mensaje, sin llamar a la API. — Evidencia: `.txt` → `role="alert"` "Formato no válido. Usa una imagen JPG, PNG o WEBP." sin preview y sin `PATCH` en el log.
- [x] La pestaña "Cambiar Contraseña" pide contraseña actual, nueva y confirmación. — Evidencia: labels "Contraseña Actual", "Nueva Contraseña", "Confirmar Nueva Contraseña".
- [x] Cambiar la contraseña con la actual correcta llama a `POST /users/profiles/update-password`, muestra toast de éxito y limpia el formulario. — Evidencia: `POST` 200 en el log; toast "Contraseña actualizada con éxito"; los tres campos quedan vacíos.
- [x] Con la actual incorrecta se muestra el error del back (401) sin romper la pantalla. — Evidencia: 401 → `role="alert"` "La contraseña actual es incorrecta"; el formulario sigue montado.
- [x] Con una cuenta `hasPassword: false`, la pestaña de contraseña está bloqueada (no seleccionable) y muestra un mensaje que explica que se gestiona con Google/GitHub. — Evidencia: pestaña `disabled` + `aria-disabled="true"` + `tabindex="-1"` y nota "Tu cuenta se gestiona con Google/GitHub…".
- [x] Las pestañas usan el patrón ARIA (`tablist`/`tab`/`tabpanel`) con `aria-selected`, `aria-controls` y navegación por flechas. — Evidencia: `role="tablist"`, tabs con `aria-selected`/`aria-controls`/`tabindex`, panel con `aria-labelledby`; ArrowRight/ArrowLeft cambian pestaña y foco.
- [x] El email no se puede editar y no se envía en `PATCH /users/profile`. — Evidencia: input `disabled`/`readOnly`; el multipart del `PATCH` no incluye `email`.
- [x] No hay etiquetas `<a>`; todo enlace usa `next/link`; props con `Readonly<>` y clases canónicas (`pnpm lint` limpio). — Evidencia: `grep -rn "<a[ >]" app components` sin resultados; `pnpm lint` limpio.
- [x] Ningún componente en `app/**`/`components/**` usa hooks vetados por SPEC 11 (todo vive en `lib/profile/hooks/**`). — Evidencia: `grep -rnE "use(State|Effect|Ref|...)" app components` sin resultados; `pnpm lint` limpio.
- [x] `/dashboard/profile` es usable a 375 px y 1440 px sin scroll horizontal y sin errores de consola. — Evidencia: `scrollWidth === clientWidth` en 375 y 1440; sin errores de consola en carga limpia (`.playwright-mcp/verify-14-profile-375.png`, `verify-14-profile-1440.png`).
- [x] `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build` pasan. — Evidencia: los tres comandos salen limpios. Se añadió `.playwright-mcp/**` a `globalIgnores` de `eslint.config.mjs` (carpeta generada por el MCP que rompía el lint).
- [x] `git -C ../nest-tensi-api status --short` muestra solo `src/auth/auth.service.ts` y `src/users/dto/update-profile.dto.ts`. — Evidencia: `git status --short` del back devuelve exactamente esos dos archivos.

## Decisiones

- **Sí:** `check-token` enriquecido (perfil + `hasPassword` + `providers`), en vez de un `GET /users/me/profile` aparte. La llamada ya está memoizada con `cache()` y la comparte el layout; evita una request nueva.
- **Sí:** se conserva el candado de la pestaña de contraseña para cuentas sin contraseña local (`hasPassword: false`) aunque el login/registro OAuth quede fuera de alcance. Es la guarda que pide el producto y coincide con el `400` del back (`!user.password`); se verifica con sesión simulada.
- **Sí:** la pestaña se bloquea con `hasPassword === false`, no con "tiene proveedor social". Un usuario con contraseña y Google/GitHub vinculados sí puede cambiar la contraseña.
- **Sí:** email de solo lectura. El back no lo acepta en `UpdateProfileDto` y el mockup no puede imponerse al contrato.
- **Sí:** peso en kg y estatura en cm en la UI, convirtiendo la estatura a metros al enviar (el back ejemplifica 1.75). Mantiene la semántica de los datos del back.
- **Sí:** multipart siempre en `PATCH /users/profile`, con `medications` repetido y `avatar` opcional; el `Transform` del DTO evita el fallo con una sola medicación.
- **Sí:** toast global + `setUser` + `router.refresh()`. El `router.refresh()` re-renderiza el layout y el header (que recibe `user` por prop del servidor) refleja el cambio.
- **Sí:** estado de la pestaña activa en un hook (sin URL), como un control local de UI.
- **Sí:** chips de los 5 grupos con fármacos; se omite "Vasodilatadores" porque el mockup lo deja vacío y no aporta selección.
- **Sí:** grupo "Otros" dinámico para medicaciones personalizadas, con chips removibles.
- **Sí:** reutilizar los primitivos de formulario del proyecto —sobre todo `FormField`— y `PasswordField`, añadiendo solo `SelectField` para el género. No se reimplementan inputs ni se cambia el aspecto de los formularios de auth.
- **Sí:** `UserProfile` del header muestra `avatarUrl` cuando existe. Es una mejora natural y de bajo riesgo.
- **No:** login/registro OAuth en el front. Va en su propia spec; aquí solo se mantiene el candado.
- **No:** campo `bio`, cambio de email, eliminar cuenta ni preferencias.
- **No:** tests automatizados (el repo no tiene runner).

## Riesgos

| Riesgo                                                                                 | Mitigación                                                                                                      |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Sin login OAuth en el front, el estado `hasPassword: false` no es alcanzable navegando | Se verifica con una sesión simulada (mock de `check-token` como en SPEC 03) y con un usuario OAuth creado en BD |
| `medications` multipart con un solo valor no pasa `@IsArray`                           | `@Transform` en el DTO que envuelve un valor único en array; criterio de aceptación específico                  |
| `FormData` en `fetch-client` puede romper las requests JSON existentes                 | Detectar `FormData` y solo entonces omitir `Content-Type`/`JSON.stringify`; el resto del contrato no cambia     |
| El header no se actualiza tras guardar porque `user` llega por prop del servidor       | `setUser` + `router.refresh()`; el criterio verifica el nombre/avatar del header                                |
| `AuthUser` crece y puede romper consumidores que construyan el objeto a mano           | Los consumidores actuales solo leen `id/username/email/plan`; `tsc` lo confirma                                 |
| Límite de 1 MB y tipos de imagen del back pueden variar                                | Validar tipo (JPG/PNG/WEBP) y tamaño (1 MB) en el cliente con el mismo límite del `ParseFilePipeBuilder`        |
| Convertir altura m↔cm con redondeo puede introducir errores                            | Redondeo a 1 decimal y prueba de ida y vuelta en los helpers                                                    |
| Doble envío del formulario mientras la mutación está en curso                          | `SubmitButton` con `aria-disabled`/`aria-busy` (SPEC 05) y guarda en el submit, como el resto de formularios    |

## Qué **no** entra en esta spec

- Login/registro OAuth en el front (va en su propia spec).
- Cambio de correo electrónico, campo `bio` y eliminación de cuenta.
- Preferencias, notificaciones y tema claro/oscuro.
- Reportes PDF y el resto de pantallas del sidebar.
- Tests automatizados y CSRF.

Cada uno, si se implementa, va en su propia spec.
