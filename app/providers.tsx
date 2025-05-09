'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ThemeProviderProps } from 'next-themes/dist/types'
import { Toaster } from 'sonner'

const queryClient = new QueryClient()

export interface ProvidersProps {
  children: ReactNode
  themeProps?: ThemeProviderProps
}

export function Providers({ children, themeProps }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider {...themeProps}>
        {children}
        <Toaster richColors position="top-right" />
      </NextThemesProvider>
    </QueryClientProvider>
  )
}
