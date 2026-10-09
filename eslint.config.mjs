import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";

// SPEC 11: estado/lógica vetados fuera de `lib/**/hooks/**`.
const restrictedLogicImports = [
  {
    name: "react",
    importNames: [
      "useState",
      "useEffect",
      "useLayoutEffect",
      "useRef",
      "useReducer",
      "useMemo",
      "useCallback",
      "useImperativeHandle",
      "useSyncExternalStore",
      "useTransition",
      "useDeferredValue",
    ],
    message:
      "Mueve el estado/lógica a un custom hook en `lib/**/hooks/**` (SPEC 11).",
  },
  {
    name: "react-hook-form",
    importNames: [
      "useForm",
      "useFormContext",
      "useController",
      "useWatch",
      "useFieldArray",
      "useFormState",
    ],
    message:
      "Envuelve React Hook Form en un custom hook de `lib/**/hooks/**` (SPEC 11).",
  },
  {
    name: "next/navigation",
    importNames: [
      "useRouter",
      "usePathname",
      "useSearchParams",
      "useParams",
    ],
    message:
      "Expón la navegación desde un custom hook de `lib/**/hooks/**` (SPEC 11).",
  },
  {
    name: "@tanstack/react-query",
    importNames: [
      "useQuery",
      "useQueries",
      "useMutation",
      "useQueryClient",
      "useInfiniteQuery",
    ],
    message:
      "Expón los datos desde un custom hook de `lib/**/hooks/**` (SPEC 11).",
  },
];

// SPEC 17: el núcleo portable `lib/**/core/**` no puede depender de Next ni del
// runtime de servidor; se reutiliza tanto en la web como en la futura app Expo.
const PORTABLE_CORE_MESSAGE =
  "El núcleo portable `lib/**/core/**` no puede depender de Next ni del runtime de servidor (SPEC 17); mueve este código a la capa web.";
const portableRestrictedModules = [
  { name: "next", message: PORTABLE_CORE_MESSAGE },
  { name: "server-only", message: PORTABLE_CORE_MESSAGE },
];

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
      // Prohibido renderizar HTML de usuario (SPEC 09): todo dato se renderiza
      // como texto por React; sin `dangerouslySetInnerHTML`.
      "react/no-danger": "error",
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
  {
    // SPEC 11: ningún componente ni página cliente contiene estado ni lógica.
    // Todo el estado vive en custom hooks de `lib/**/hooks/**`, que quedan
    // exentos del allowlist. `useId` y `useContext` siguen permitidos.
    files: [
      "app/**/*.{ts,tsx}",
      "components/**/*.{ts,tsx}",
      "lib/**/*.{ts,tsx}",
    ],
    ignores: ["lib/**/hooks/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: restrictedLogicImports,
        },
      ],
    },
  },
  {
    // SPEC 17: guard de la capa portable `lib/**/core/**`. Prohíbe acoplarla a
    // Next (o al runtime de servidor) y usar globals de navegador, para que el
    // núcleo pueda reutilizarse en la futura app Expo. Al combinarse con el
    // bloque anterior (que este overridea para estos archivos), se repiten las
    // restricciones de SPEC 11 para no perderlas en `core`.
    files: ["lib/**/core/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [...restrictedLogicImports, ...portableRestrictedModules],
          patterns: [
            {
              group: ["next/*"],
              message: PORTABLE_CORE_MESSAGE,
            },
          ],
        },
      ],
      "no-restricted-globals": [
        "error",
        {
          name: "window",
          message:
            "El núcleo portable `lib/**/core/**` no puede usar `window` (SPEC 17); aísla el acceso al DOM en la capa web.",
        },
        {
          name: "document",
          message:
            "El núcleo portable `lib/**/core/**` no puede usar `document` (SPEC 17); aísla el acceso al DOM en la capa web.",
        },
        {
          name: "localStorage",
          message:
            "El núcleo portable `lib/**/core/**` no puede usar `localStorage` (SPEC 17); aísla la persistencia en la capa web.",
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
    // Carpeta generada por el MCP de Playwright (ver AGENTS.md); no es código
    // de la app y no debe lintarse.
    ".playwright-mcp/**",
  ]),
]);

export default eslintConfig;
