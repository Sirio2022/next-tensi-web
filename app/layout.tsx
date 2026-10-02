import { ToastProvider } from "@/components/site/toast"
import { QueryProvider } from "@/lib/query/query-provider"
import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"]
})

/**
 * Base de las URLs absolutas de `metadata` (OpenGraph, Twitter…). En dev cae a
 * `localhost` para no romper el build si falta la env en producción.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

const SITE_DESCRIPTION =
  "Controla tu presión arterial de forma inteligente y mejora tu salud cardiovascular."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s — Tensi",
    default: "Tensi — Controla tu presión arterial"
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Tensi",
    title: "Tensi — Controla tu presión arterial",
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "es_CO"
  },
  twitter: {
    card: "summary_large_image",
    title: "Tensi — Controla tu presión arterial",
    description: SITE_DESCRIPTION
  }
}

/**
 * `themeColor` ya no vive en `metadata` (Next 15+): se exporta con `viewport`.
 * Se usa el mismo valor que `--background` en `app/globals.css` para que la
 * barra del navegador combine con el fondo real de la app.
 */
export const viewport: Viewport = {
  themeColor: "#030712"
}

export default function RootLayout({ children }: Readonly<LayoutProps<"/">>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${plusJakartaSans.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col overflow-x-clip">
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
