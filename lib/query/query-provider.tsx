'use client'

import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })
}

/**
 * Cliente por render en el server (para no compartir caché entre peticiones) y
 * uno único y persistente en el navegador. Se evita `useState` a propósito: sin
 * una frontera de `Suspense` por debajo, React descarta el cliente del primer
 * render si este suspende y se perdería la caché acumulada.
 */
let browserQueryClient: QueryClient | undefined

function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') return makeQueryClient()
  browserQueryClient ??= makeQueryClient()
  return browserQueryClient
}

/** Client boundary que monta el `QueryClient` de TanStack Query. */
export function QueryProvider({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>
}
