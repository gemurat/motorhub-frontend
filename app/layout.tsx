import '@/styles/globals.css'
import { Metadata, Viewport } from 'next'
import clsx from 'clsx'
import { headers } from 'next/headers'
import { validateEnv } from '@/utils/env'
import { fontSans } from '@/config/fonts'
import { siteConfig } from '@/config/site'
import ClientLayout from '@/components/ClientLayout'
import AuthProvider from '@/components/AuthProvider'
import { UserProvider } from '@auth0/nextjs-auth0/client'
import { Providers } from '@/components/providers'

// Validate environment variables
validateEnv()

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head />
      <body
        className={clsx(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <Providers>
          <UserProvider>
            <AuthProvider>
              <ClientLayout>{children}</ClientLayout>
            </AuthProvider>
          </UserProvider>
        </Providers>
      </body>
    </html>
  )
}
