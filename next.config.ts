import type { NextConfig } from "next"

const isDev = process.env.NODE_ENV === "development"

// Origen de la API para `connect-src`, derivado de NEXT_PUBLIC_API_URL.
const apiOrigin = (() => {
  const url = process.env.NEXT_PUBLIC_API_URL
  if (!url) return ""
  try {
    return new URL(url).origin
  } catch {
    return ""
  }
})()

// CSP sin nonce (convive con el proxy.ts de sesión). `unsafe-eval` solo en
// dev, `upgrade-insecure-requests` solo en prod. En dev se permiten websockets
// locales (HMR y herramientas como Console Ninja); en prod, `connect-src` se
// limita a 'self' y al origen de la API.
const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' https://fonts.gstatic.com",
  [
    "connect-src 'self'",
    apiOrigin ? ` ${apiOrigin}` : "",
    isDev ? " ws://localhost:* ws://127.0.0.1:*" : ""
  ].join(""),
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"])
]

const contentSecurityPolicy = cspDirectives.join("; ")

// CSP_ENFORCE=true pasa de Report-Only a enforce (misma lista de directivas).
const cspHeaderKey =
  process.env.CSP_ENFORCE === "true"
    ? "Content-Security-Policy"
    : "Content-Security-Policy-Report-Only"

// Cabeceras de seguridad estáticas (SPEC 09).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()"
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: cspHeaderKey, value: contentSecurityPolicy }
]

const nextConfig: NextConfig = {
  typedRoutes: true,
  headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      }
    ]
  }
}

export default nextConfig
