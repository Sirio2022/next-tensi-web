# SPEC 07 — Convención de navegación: nunca `<a>`, siempre `next/link`

> **Status:** Borrador
> **Depends on:** SPEC 04
> **Date:** 2026-10-02
> **Objective:** Establecer, documentar y forzar con ESLint la convención de usar siempre `next/link` (nunca `<a>`) y migrar los `<a>` existentes.

## Por qué existe esta spec

- La convención del proyecto debe quedar explícita para personas y agentes.
- Hoy hay `<a>` crudos en `components/site/site-header.tsx` (nav) y `components/site/site-footer.tsx` (Términos/Privacidad y `#contacto`).
- `next/link` aporta prefetch, navegación cliente y accesibilidad coherente, y funciona también con URLs absolutas y anclas `#hash`.

## Alcance

**In:**

- Documentar la regla en `AGENTS.md` (sección de convenciones de UI/navegación): siempre `next/link`; **nunca** etiquetas `<a>` en el JSX de la app, incluidas anclas de misma página y enlaces externos.
- Añadir la regla a los checklists de los agentes: `.opencode/agents/react-best-practices.md` y, si define checklist propio, el agente `accessibility-checker`.
- Forzar con ESLint en `eslint.config.mjs`:
  - `@next/next/no-html-link-for-pages: "error"`.
  - `no-restricted-syntax` con el selector `JSXOpeningElement[name.name='a']` y el mensaje "Usa `next/link`; las etiquetas `<a>` no están permitidas".
- Migrar a `<Link>`:
  - `components/site/site-header.tsx`: `NAV_LINKS` (`#caracteristicas`, `#simulador`, `#tendencias`, `#contacto`) en el nav de escritorio y móvil.
  - `components/site/site-footer.tsx`: el `<a href="#contacto">` (el resto de placeholders pasa a texto no interactivo en SPEC 06).
- Tipar las anclas para `typedRoutes` (SPEC 04): usar `href={"#simulador" as Route}` o un helper tipado cuando el tipo `Route` no acepte el hash.
- Verificar que no queden `<a>` en el código de la app salvo el HTML que genera `next/link`.

**Out of scope (para specs futuras):**

- Cambiar la estructura de navegación, rutas o contenidos.
- Rediseño del header/footer.
- Enlaces a Términos/Privacidad (siguen sin rutas; SPEC 06 los deja como texto).

## Modelo de datos

No hay estructuras nuevas. Si hiciera falta, un helper tipado para anclas:

```ts
// lib/nav/anchors.ts (solo si typedRoutes lo exige)
import type { Route } from 'next'
export const anchor = (id: `#${string}`): Route => id as Route
```

## Plan de implementación

1. Añadir la regla a `AGENTS.md` y a los checklists de los agentes. Verificación: la regla aparece en los archivos.
2. Añadir las reglas de ESLint. Verificación: un `<a>` de prueba en un archivo temporal dispara error (luego se elimina).
3. Migrar `site-header.tsx` (`NAV_LINKS` → `<Link>`). Verificación: las anclas siguen desplazando a su sección; `lint`/`tsc`.
4. Migrar el `<a href="#contacto">` de `site-footer.tsx`. Verificación: `grep -rn "<a " components app` no encuentra resultados.
5. Ajustar el tipado de anclas para `typedRoutes`. Verificación: `pnpm exec tsc --noEmit` y `pnpm build`.

## Criterios de aceptación

- [ ] `AGENTS.md` contiene la regla "nunca `<a>`, siempre `next/link`" con su motivación y alcance (internos, externos y anclas).
- [ ] Los checklists de los agentes mencionados incluyen la regla.
- [ ] `grep -rn "<a[ >]" app components` no devuelve ninguna etiqueta `<a>`.
- [ ] Un `<a>` introducido a propósito dispara error de ESLint (`no-restricted-syntax`).
- [ ] Las anclas del header y del footer navegan a su sección (Playwright).
- [ ] Los enlaces externos (si los hubiera) usan `<Link>`.
- [ ] Con `typedRoutes: true`, los `<Link>` con hash compilan y el build es verde.
- [ ] `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build` pasan.

## Decisiones

- **Sí:** la regla es absoluta: no se permiten etiquetas `<a>` en el JSX de la app.
- **Sí:** `Link` también para enlaces externos y anclas de misma página.
- **Sí:** enforcement por ESLint (`no-restricted-syntax` + `no-html-link-for-pages`), no solo documentación.
- **Sí:** documentar en `AGENTS.md` y en los checklists de agentes, que es lo que consumen humanos y IA.
- **No:** dejar excepciones para anclas internas.

## Riesgos

| Riesgo                                                          | Mitigación                                                                 |
| --------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `no-restricted-syntax` bloquea ejemplos legítimos de terceros     | Revisar `globalIgnores`/overrides si algún archivo generado lo necesita     |
| `Link` con `href="#hash"` no desplaza igual que `<a>`             | Probar con Playwright; usar `scroll`/`scrollIntoView` si difiere           |
| `typedRoutes` rechaza hashes                                      | Helper `anchor()` tipado como `Route` en `lib/nav/anchors.ts`              |
| La regla rompe builds por `<a>` en código generado                | Acotar la regla a `app/**` y `components/**`                              |

## Qué **no** entra en esta spec

- Cambios de rutas, navegación o contenido.
- Rediseño de header/footer.
- Rutas de Términos y Privacidad (SPEC 06 los deja como texto).

Cada uno, si se implementa, va en su propia spec.
