"use client"

import { useEffect, useRef } from "react"
import { Provider } from "react-redux"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { store } from "@/store"
import { hydrateAuthState } from "@/store/slices/auth-slice"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
})

function AppProviders({ children }: { children: React.ReactNode }) {
  const hydrated = useRef(false)

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true
      store.dispatch(hydrateAuthState())
    }
  }, [])

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AppProviders>
            {children}
            <Toaster position="top-right" closeButton />
          </AppProviders>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  )
}
