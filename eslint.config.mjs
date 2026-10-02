import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "better-tailwindcss": betterTailwindcss,
    },
    settings: {
      "better-tailwindcss": {
        // Entry point del CSS de Tailwind v4 (los tokens viven en globals.css).
        entryPoint: "app/globals.css",
      },
    },
    rules: {
      // Los props de los componentes se declaran read-only (Readonly<...>).
      // El plugin `react` ya está registrado por eslint-config-next.
      "react/prefer-read-only-props": "error",
      // Prefiere el elemento nativo cuando exista equivalente (p. ej. <output>
      // en lugar de role="status"). El plugin `jsx-a11y` ya viene registrado.
      "jsx-a11y/prefer-tag-over-role": "warn",
      // Forma canónica de Tailwind: p. ej. `w-250` en vez de `w-[1000px]`
      // (píxeles ÷ 4 = escala --spacing de 0.25rem, con root 16px).
      "better-tailwindcss/enforce-canonical-classes": [
        "error",
        { rootFontSize: 16 },
      ],
      // Evita espacios sobrantes dentro de las listas de clases.
      "better-tailwindcss/no-unnecessary-whitespace": "error",
    },
  },
  {
    // Convención de navegación: siempre `next/link`, nunca etiquetas `<a>`
    // (ver AGENTS.md). Se acota a las carpetas de UI de la app para no
    // bloquear código generado o de ejemplo.
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
    rules: {
      "@next/next/no-html-link-for-pages": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXOpeningElement[name.name='a']",
          message: "Usa `next/link`; las etiquetas `<a>` no están permitidas.",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
