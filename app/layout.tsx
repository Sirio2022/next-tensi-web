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

export const metadata: Metadata = {
  title: "Tensi — Controla tu presión arterial",
  description:
    "Controla tu presión arterial de forma inteligente y mejora tu salud cardiovascular."
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
