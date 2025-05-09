'use client'

import { useUser } from '@auth0/nextjs-auth0/client'
import { SessionProvider } from '@/contexts/SessionContext'
import { NextUIProvider } from '@nextui-org/system'
import { Providers } from '@/app/providers'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import { useTheme } from 'next-themes'
import { useEffect } from 'react'

interface ClientLayoutProps {
  children: React.ReactNode
}

function LayoutContent({ children }: ClientLayoutProps) {
  const { user, isLoading } = useUser()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    // Set initial theme based on system preference
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'
      setTheme(systemTheme)
    }
  }, [theme, setTheme])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen transition-colors duration-300">
      {user ? (
        <AuthenticatedLayout>{children}</AuthenticatedLayout>
      ) : (
        <main className="relative flex flex-col min-h-screen">{children}</main>
      )}
    </div>
  )
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <SessionProvider>
      <Providers themeProps={{ attribute: 'class', defaultTheme: 'system' }}>
        <NextUIProvider>
          <LayoutContent>{children}</LayoutContent>
        </NextUIProvider>
      </Providers>
    </SessionProvider>
  )
}
