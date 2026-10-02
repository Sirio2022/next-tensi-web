import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // Los props de los componentes se declaran read-only (Readonly<...>).
      // El plugin `react` ya está registrado por eslint-config-next.
      "react/prefer-read-only-props": "error",
      // Prefiere el elemento nativo cuando exista equivalente (p. ej. <output>
      // en lugar de role="status"). El plugin `jsx-a11y` ya viene registrado.
      "jsx-a11y/prefer-tag-over-role": "warn",
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
