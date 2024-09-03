'use client'
import * as React from 'react'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import Typography from '@mui/material/Typography'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window?: () => Window
}

const navItems = [
  { name: 'Ventas', link: '/ventas' },
  { name: 'Inventario', link: '/inventario' },
  { name: 'Finanzas', link: '/finanzas' },
  { name: 'Reportes', link: '/reportes' },
]

export default function NavigationBar(props: Props) {
  const router = usePathname()
  const currentPage = router
  console.log(currentPage)

  return (
    <Box sx={{ height: '100dvh', bgcolor: 'gray' }}>
      <CssBaseline />
      <div>
        <Typography
          fontWeight={'700'}
          align="center"
          color={'white'}
          fontSize={'32px'}
          marginBottom={'20px'}
        >
          M&H
        </Typography>
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.link}
            style={{ textDecoration: 'none', backgroundColor: 'darkgray' }}
            passHref
          >
            <Typography
              fontWeight={'400'}
              color={currentPage == item.link ? 'lightgrey' : 'white'}
              align="center"
            >
              {item.name}
            </Typography>
          </Link>
        ))}
      </div>
    </Box>
  )
}
