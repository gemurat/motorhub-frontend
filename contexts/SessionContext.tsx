'use client'

import { createContext, useContext } from 'react'
import { useCustomSession } from '@/hooks/useSession'

type SessionContextType = {
  user: any
  role: string | null
  isLoading: boolean
  error: Error | null
  refreshSession: () => Promise<void>
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  role: null,
  isLoading: true,
  error: null,
  refreshSession: async () => {},
})

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const session = useCustomSession()

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSessionContext = () => useContext(SessionContext)
