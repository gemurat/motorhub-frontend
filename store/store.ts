import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

export interface Store {
  id: number
  name: string
  address?: string
  phone?: string
  email?: string
}

// This will be used to store the selected store ID in localStorage
export const STORE_KEY = 'selected-store-id'
