'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useCustomSession } from '@/hooks/useSession'

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, refreshSession } = useCustomSession()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user && pathname !== '/' && !pathname.startsWith('/api/auth')) {
        router.push('/api/auth/login')
      } else if (user) {
        // Refresh session on mount for authenticated users
        refreshSession()
      }
    }
  }, [user, isLoading, pathname, router, refreshSession])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return <>{children}</>
}
