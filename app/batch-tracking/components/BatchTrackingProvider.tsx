'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

const queryClient = new QueryClient()

interface BatchTrackingProviderProps {
  children: ReactNode
}

export function BatchTrackingProvider({
  children,
}: BatchTrackingProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
