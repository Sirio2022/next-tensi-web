# Revisión de buenas prácticas React — capa `lib/` (auth, http, query, bp)

- **Fecha:** 2026-10-01
- **Objetivo:** `lib/auth/*` (context, hooks, DAL, api, schemas, types), `lib/bp/*`, `lib/query/query-provider.tsx`, `lib/http/*`
- **Referencias:** React 19.2.8 + Next.js 16.3.7 (App Router) + Context7 (`/reactjs/react.dev`, `/vercel/next.js`, `/tanstack/query`)
- **Estado final:** `pnpm lint` ✅ · `pnpm exec tsc --noEmit` ✅ · `pnpm build` ✅

---

## 1. Resumen ejecutivo

Se auditaron **17 archivos**. La capa está en buen estado: no hay violaciones de las reglas de los hooks, no hay `useEffect` que derive estado, no hay memoización innecesaria en la capa de formularios y la frontera Server/Client es la mínima necesaria.

Se detectaron **12 hallazgos**: **0 de severidad alta**, **2 media** y **10 baja**. Se aplicaron **4 correcciones** (2 media + 2 baja, una de ellas en el seguimiento §3.3) en 4 archivos; el resto son recomendaciones que alterarían comportamiento, API pública o requerirían archivos fuera del alcance autorizado, por lo que se describen sin aplicarse.

Los dos hallazgos de severidad media son reales y están respaldados por documentación oficial:

1. `AuthProvider` construía el objeto del contexto en línea → nueva identidad en cada render del provider y re-render de todos los consumidores. React recomienda memoizarlo (`useMemo`).
2. `QueryProvider` inicializaba el `QueryClient` con `useState` sin una frontera de `Suspense` por debajo: TanStack advierte explícitamente que React descarta el cliente en el primer render si este suspende, perdiendo la caché. Next.js 16 y TanStack prescriben el patrón `getQueryClient()`.

**Archivos sin ningún hallazgo:** `lib/auth/dal.ts`, `lib/auth/auth.api.ts`, `lib/auth/schemas.ts`, `lib/http/types.ts`.

---

## 2. Tabla de hallazgos

| # | Archivo | Línea / evidencia | Hallazgo | Severidad | Recomendación | ¿Aplicado? |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `lib/auth/auth-context.tsx` | `27` (antes): `<AuthContext.Provider value={{ user, setUser }}>` | El objeto del contexto se crea en línea en cada render del provider → identidad nueva y re-render de **todos** los consumidores aunque `user` no cambie (p. ej. al re-renderizar el layout tras `router.refresh()` o al navegar por el área autenticada). React compara el `value` con `Object.is`. | **Media** | Memoizar con `useMemo(() => ({ user, setUser }), [user])`. `setUser` de `useState` es estable. | ✅ Sí |
| 2 | `lib/auth/auth-context.tsx` | `27` (antes): `<AuthContext.Provider>` | Sintaxis de provider anterior a React 19; la doc de `createContext` la etiqueta como *"Legacy provider component used before React 19"*. Desde React 19 se puede renderizar `<Context>` directamente. | Baja | Usar `<AuthContext value={value}>`. Cambio sin efecto en runtime. | ✅ Sí |
| 3 | `lib/query/query-provider.tsx` | `12-23` (antes): `const [queryClient] = useState(() => new QueryClient({...}))` | TanStack documenta: *"Avoid `useState` when initializing the query client if you don't have a suspense boundary between this and the code that may suspend because React will throw away the client on the initial render if it suspends"*. En esta app el provider está en el layout raíz y **no** hay `Suspense` debajo → riesgo real en cuanto algún componente cliente use `useSuspenseQuery`. La doc de Next 16 también prescribe cliente nuevo por render en el server y singleton en el navegador. | **Media** | Patrón oficial `makeQueryClient()` + `getQueryClient()` con `typeof window === 'undefined'` y `browserQueryClient ??=`. Se conservan `defaultOptions`. | ✅ Sí |
| 4 | `lib/auth/hooks/use-auth.ts` | `49`: `void queryClient.invalidateQueries({ queryKey: ['auth', 'session'] })` | Se invalida una query que **nadie registra**: la sesión vive en `AuthProvider` (React Context) y el `useAuth` de las pantallas de auth corre fuera del provider. `invalidateQueries` sobre una key sin consumidores es un no-op (solo queda como "stale" si algún día se consulta). | Baja | O bien eliminar la llamada, o bien extraer un contrato compartido (`sessionQuery.key`) y consumirlo con `useQuery`. Requiere decidir el patrón de sesión → no se aplica sin confirmación. | ❌ No |
| 5 | `lib/auth/hooks/use-login-form.ts` (y los otros 4 hooks de formulario) | `22-28`, `35`: `const onSubmit = form.handleSubmit(...)`, `goToForgotPassword: () => router.push(...)` | Las funciones devueltas por el hook se recrean en cada render y no están envueltas en `useCallback`. La doc de React lo menciona para hooks personalizados *"so that consumers of the Hook can optimize their own code"*. | Baja | Añadir `useCallback` **solo** si el consumidor pasa a estar memoizado (`React.memo`) o si el valor se usa como dependencia de un efecto. Hoy los consumidores son componentes no memoizados → beneficio nulo. | ❌ No |
| 6 | `lib/auth/hooks/use-verify-form.ts:24` y `lib/auth/hooks/use-reset-form.ts:24` | `useForm({ defaultValues: { email, ... } })` | `defaultValues` se lee solo en el montaje de RHF. Si el prop `email` cambia en una navegación cliente sobre la misma ruta (solo cambia el query param), el campo conserva el valor anterior. La solución **no** debe ser un `useEffect` props→estado: React lo desaconseja explícitamente (*"Avoid: Adjusting state on prop change in an Effect"*). | Baja | Opciones idiomáticas: pasar `key={email}` al formulario (reset por identidad) o usar la prop `values` de RHF. Ambas tocan `components/auth/*` (fuera de alcance) y cambian comportamiento → se describe. | ❌ No |
| 7 | `lib/http/fetch-client.ts` | `73-85`: `const response = await fetch(...)` | No hay timeout por defecto ni `AbortController`. El contrato sí acepta `signal` (`HttpRequestOptions.signal`), así que la cancelación es posible, pero una request colgada bloquearía una mutación indefinidamente. | Baja | Aceptar un `timeout?: number` opcional y combinarlo con `AbortSignal.timeout()`/`AbortSignal.any()`. Añadir un timeout por defecto **cambia comportamiento** → requiere decisión. | ❌ No |
| 8 | `lib/http/fetch-client.ts` | `10-11`, `37`: `const errorBody = body as Partial<ApiErrorBody> \| undefined`; `93`: `return parsed as T` | Casts sin validación en runtime. Si la API devuelve un cuerpo no-JSON (p. ej. una página de error HTML de un proxy), `parseBody` devuelve `string` y `parsed as T` lo propaga como si fuera el tipo esperado en un 2xx. | Baja | Introducir un type guard mínimo para `ApiErrorBody` y/o validar la forma en éxito (p. ej. `T` sólo cuando `Content-Type` es JSON). Es endurecimiento de tipos, no un bug observado. | ❌ No |
| 9 | `lib/http/http.ts` | `15`: `export const httpServer: HttpClient = createFetchClient()` | `httpServer` no se usaba en ningún sitio (el DAL creaba su propio cliente con la cookie) y se exportaba desde un módulo que importan componentes cliente (`auth.api.ts` → `http`), sin marca `server-only`; al ser un cliente global tampoco podía recibir la cookie por request. | Baja | Eliminar la export muerta de `http.ts` y marcar con `import 'server-only'` el DAL real (`lib/auth/dal.ts`), que es quien usa `next/headers`. | ✅ Sí (seguimiento §3.3) |
| 10 | `lib/auth/types.ts` | `20`: `export { ApiError } from '@/lib/http/types'` | Un módulo llamado `types.ts` reexporta un **valor** (la clase `ApiError`), generando dos rutas de import para la misma clase (`@/lib/auth/types` y `@/lib/http/types`). No rompe nada, pero difumina la frontera tipo/valor. | Baja | Importar `ApiError` directamente desde `@/lib/http/types` (como ya hace `http/fetch-client.ts`) y dejar `types.ts` solo con tipos. Al ser superficie pública, se describe. | ❌ No |
| 11 | `lib/bp/bp-categories.ts` | `65`: `if (category.includes('hypotension'))` | La distinción hipo/hipertensión se hace con `String.includes`. Funciona (la tabla es fija y `'hypertension'` no contiene `'hypotension'`), pero es una heurística frágil ante un nombre nuevo. | Baja | Sustituir por un `Set<BpCategory>` explícito de categorías de hipotensión o por un `kind` en la tabla de rangos. Refactor cosmético → se describe. | ❌ No |
| 12 | `lib/bp/hooks/use-bp-calculator.ts` | `42-46`: `useMemo(() => { ... categorize(...) }, [systolicValue, diastolicValue])` | `categorize()` recorre 9 entradas: coste no medible. React reserva `useMemo` para cómputo caro o estabilidad referencial de props. | Baja | Puede eliminarse. **No se aplica** porque el memo sí evita recalcular y regenerar `result` cuando solo cambia `pulse`; es una defensa razonable y el valor no se pasa a componentes memoizados. Se documenta como "aceptable, no incumplimiento". | ❌ No |

### Contadores

| Severidad | Nº | Aplicados |
| --- | --- | --- |
| Alta | 0 | 0 |
| Media | 2 | 2 |
| Baja | 10 | 2 |
| **Total** | **12** | **4** |

---

## 3. Cambios aplicados

### 3.1 `lib/auth/auth-context.tsx` (hallazgos 1 y 2)

```diff
-import { createContext, useContext, useState, type ReactNode } from 'react'
+import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

 export function AuthProvider({ initialUser, children }: AuthProviderProps) {
   const [user, setUser] = useState<AuthUser | null>(initialUser)
 
-  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>
+  // El valor del contexto se memoiza para que los consumidores no se
+  // re-rendericen cuando el provider lo hace por motivos ajenos a `user`
+  // (p. ej. el nuevo render del layout tras `router.refresh()` o al navegar).
+  const value = useMemo<AuthContextValue>(() => ({ user, setUser }), [user])
+
+  return <AuthContext value={value}>{children}</AuthContext>
 }
```

- `setUser` procede de `useState` y es referencialmente estable, por lo que `[user]` es la lista de dependencias correcta (lo confirma `react-hooks/exhaustive-deps` sin silencios).
- No cambia la API pública del provider ni el tipo `AuthContextValue`.

### 3.2 `lib/query/query-provider.tsx` (hallazgo 3)

```diff
-import { useState, type ReactNode } from 'react'
+import type { ReactNode } from 'react'
 import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
 
-export function QueryProvider({ children }: { children: ReactNode }) {
-  const [queryClient] = useState(
-    () =>
-      new QueryClient({
-        defaultOptions: { queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false } },
-      }),
-  )
+function makeQueryClient() {
+  return new QueryClient({
+    defaultOptions: { queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false } },
+  })
+}
+
+let browserQueryClient: QueryClient | undefined
+
+function getQueryClient(): QueryClient {
+  if (typeof window === 'undefined') return makeQueryClient()
+  browserQueryClient ??= makeQueryClient()
+  return browserQueryClient
+}
 
-  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
+export function QueryProvider({ children }: { children: ReactNode }) {
+  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>
 }
```

- Se conservan exactamente los `defaultOptions` originales.
- Server: un cliente nuevo por render (aislamiento entre peticiones). Navegador: singleton a nivel de módulo, estable aunque el árbol suspenda durante el render inicial.
- Sin nuevas dependencias para este cambio.

### 3.3 Correcciones de seguimiento (post-auditoría)

Al revisar la afirmación de este informe sobre `lib/auth/dal.ts` se detectó un error y se cerró el hallazgo 9:

- **`lib/auth/dal.ts`**: se añadió `import 'server-only'` como primera línea. **El informe afirmaba que ya estaba; no era cierto** (solo había un comentario con esas palabras). Es el guardarraíl correcto porque el DAL usa `next/headers` (`cookies()`), que no puede bundlearse en el cliente.
- **`lib/http/http.ts`**: eliminada la export muerta `httpServer` (sin consumidores y sin poder recibir la cookie por request al ser un cliente global).
- **`lib/auth/auth.api.ts`**: corregido el comentario que mencionaba `httpServer` (ya no existe).
- **`package.json`**: añadida la dependencia `server-only@0.0.1` (el spec ya la listaba en su paso 1, pero no estaba instalada).

Verificado con `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build` (10/10 páginas).

---

## 4. Archivos revisados sin hallazgos

| Archivo | Verificación |
| --- | --- |
| `lib/auth/dal.ts` | Patrón oficial de Data Access Layer: `cache()` de React envolviendo la lectura (`:17`), `await cookies()` (`:18`) y reenvío explícito de la cookie al `fetch` server (`:25`). La memoización por render pass evita llamadas duplicadas desde layout + page. Manejo correcto de 401/403 → `null` y re-lanzado del resto de errores. **Corrección:** este informe afirmó por error que el archivo ya tenía `import 'server-only'`; no lo tenía (solo un comentario con esas palabras). Se añadió en el seguimiento (§3.3). |
| `lib/auth/auth.api.ts` | Funciones puras que reciben `HttpClient` inyectado (`:12-14`); sin hooks, sin estado, sin directivas innecesarias. Isomorfo y utilizable desde server y cliente. |
| `lib/auth/schemas.ts` | zod v4 bien usado: `z.email()` de nivel superior (`:12`), `.pipe()` para separar "obligatorio" de "formato", regex de política replicando el DTO del backend. Sin `any`, sin defaults mutables compartidos. |
| `lib/http/types.ts` | `ApiError` extiende `Error` correctamente para `target: ES2017` (no hace falta el `setPrototypeOf` que sí requiere ES5); `details` y `status` son `readonly`; el contrato `HttpClient` está tipado sin `any`. |

Además: en **ninguno** de los 17 archivos hay `useEffect` (por tanto no hay limpieza pendiente, ni fugas de suscripciones, ni efectos en cascada), ni hooks condicionales, ni hooks tras un `return` temprano, ni `useEffect` usado como handler de eventos, ni mutación directa de props/estado, ni `any`.

### Detalles que revisé y consideré correctos (para que quede constancia)

- **Frontera Server/Client mínima:** `'use client'` aparece solo donde se usan hooks/estado (`auth-context.tsx`, los 5 hooks de formulario, `use-bp-calculator.ts`, `query-provider.tsx`). `dal.ts` usa `server-only` (añadido en §3.3); `auth.api.ts`, `schemas.ts`, `types.ts`, `bp-categories.ts` y `lib/http/*` permanecen isomorfos.
- **Props serializables en la frontera:** `AuthProvider` recibe `initialUser: AuthUser` (objeto plano) desde un Server Component. `auth-context.tsx` no pasa funciones ni clases del server al cliente.
- **Datos derivados en render, no en estado:** `use-bp-calculator.ts:39-40` calcula `systolicValue`/`diastolicValue` durante el render (patrón recomendado), y `use-auth.ts:83-90` deriva `isBusy` de los `isPending` de las mutaciones.
- **Reglas de los hooks:** los 7 hooks llaman a sus hooks en el nivel superior, sin condicionales ni bucles; las lecturas de contexto (`useOptionalAuthContext`) ocurren antes de cualquier lógica.
- **Caché y deduplicación de `fetch`:** en Next 15+/16 el `fetch` no se cachea por defecto, así que `verifySession()` siempre consulta la API en cada request (correcto para auth); la deduplicación dentro de un mismo render la aporta `cache()` de React.
- **React Query:** `useMutation` con `onSuccess` para invalidar/refrescar y `mutateAsync` + `try/catch` en los formularios es el patrón documentado. El uso de Server Actions + `useActionState` **no** aplica aquí porque el proyecto usa deliberadamente RHF + zod + TanStack Query (y la spec `specs/auth/01-*` lo fija como decisión de arquitectura).
- **Sin patrones legacy de React:** no hay `forwardRef`, `defaultProps`, refs string, ni `React.FC`. Los componentes de estos archivos tipan props explícitamente.

---

## 5. No verificable

- **Impacto real en re-renders** (hallazgos 1 y 3): no hay runner de tests en el repo (`package.json` no define `test` ni hay dependencias de testing), por lo que no pude medir con un contador de renders antes/después. La corrección se apoya en la documentación oficial de React (`useContext` → *"React automatically re-renders all the children that use a particular context"*, comparación con `Object.is`) y de TanStack Query (nota explícita sobre `useState` sin frontera de `Suspense`), no en una medición.
- **Verificación en navegador de los flujos de auth** (login/registro/verificación/reset/logout): requeriría la API Nest levantada y no estaba disponible; `pnpm build` confirma que las rutas compilan y se prerenderizan/renderizan, pero no que el backend responda.
- **Hallazgo 4** (query key `['auth','session']` sin consumidores): confirmado por búsqueda estática en el repo; no pude verificar en runtime si alguna ruta futura la registra.
- **Hallazgo 8** (cuerpo no-JSON en 2xx): no reproducible sin un proxy/API que devuelva ese caso; queda como endurecimiento recomendado, no como bug confirmado.

---

## 6. Evidencia de las verificaciones

| Verificación | Resultado |
| --- | --- |
| `pnpm lint` (antes y después) | Sin errores ni warnings |
| `pnpm exec tsc --noEmit` (antes y después) | Exit 0 |
| `pnpm build` (después) | `✓ Compiled successfully` — 10/10 páginas generadas, incluidas `/dashboard`, `/login`, `/register`, `/verify-account`, `/reset-password` |
| `pnpm lint` / `tsc` / `build` (seguimiento §3.3) | Sin errores; build 10/10 páginas |
| Context7 `/reactjs/react.dev` | `useContext` (memoizar el value con `useMemo`/`useCallback`), `createContext` (`<SomeContext>` como provider desde React 19; `<SomeContext.Provider>` = *legacy*), reglas de los hooks, `useCallback` en hooks personalizados, `you-might-not-need-an-effect` (no ajustar estado desde props en un efecto) |
| Context7 `/vercel/next.js` | `authentication` (DAL con `cache()` + `cookies()`), `server-only`, guía TanStack Query de Next 16 (`getQueryClient` con singleton en navegador) |
| Context7 `/tanstack/query` | `advanced-ssr` (evitar `useState` para el `QueryClient` sin frontera de `Suspense`), `invalidations-from-mutations` |

## 7. Archivos modificados

- `lib/auth/auth-context.tsx`
- `lib/query/query-provider.tsx`
- `lib/auth/dal.ts`, `lib/http/http.ts`, `lib/auth/auth.api.ts` y `package.json` (correcciones de seguimiento, §3.3)

No se hicieron commits.

> Nota: `git status` muestra además cambios sin commitear en `app/layout.tsx`, `app/(auth)/layout.tsx`, `components/landing/*` y `components/site/*` que **no** corresponden a este trabajo (provienen de sesiones en paralelo). Este informe solo cubre los archivos listados arriba.

Verificación con `git diff` de ambos archivos: diff acotado a la memoización del contexto, al paso a la sintaxis de provider de React 19 y al patrón `getQueryClient()`.
