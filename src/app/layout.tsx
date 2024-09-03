import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { UserProvider } from '@auth0/nextjs-auth0/client'

// import '../styles.css'
import NavigationBar from './NavigationBar'
import { Grid } from '@mui/material'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gestion & Ventas',
  description: 'Sistema de gestion y ventas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Grid container>
          <Grid item xs={1}>
            <NavigationBar />
          </Grid>
          <Grid item xs={11}>
            {children}
          </Grid>
        </Grid>
      </body>
    </html>
  )
}
