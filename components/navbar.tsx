'use client'
import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
} from '@nextui-org/navbar'
import { link as linkStyles } from '@nextui-org/theme'
import NextLink from 'next/link'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

import { ThemeSwitch } from '@/components/theme-switch'
import { Logo } from '@/components/icons'
import Logout from '@/app/logout'
import { getSession } from '@auth0/nextjs-auth0'
import { Claims } from '@auth0/nextjs-auth0'

const Navbar = () => {
  const [user, setUser] = useState<Claims | null>(null)

  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession()
      if (session?.user) {
        setUser(session.user)
      }
    }

    fetchSession()
  }, [])

  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      {user ? (
        <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
          <NavbarBrand as="li" className="gap-3 max-w-fit">
            <NextLink
              className="flex justify-start items-center gap-1"
              href="/"
            >
              <Logo />
              <p className="font-bold text-inherit">MotorHub</p>
            </NextLink>
          </NavbarBrand>
          <NavbarItem>
            <NextLink href="/ventas" className={clsx(linkStyles(), 'text-sm')}>
              Ventas
            </NextLink>
          </NavbarItem>
          <NavbarItem>
            <NextLink
              href="/reportes"
              className={clsx(linkStyles(), 'text-sm')}
            >
              Reportes
            </NextLink>
          </NavbarItem>
          <NavbarItem>
            <Logout />
          </NavbarItem>
        </NavbarContent>
      ) : (
        <NavbarContent className="basis-1/5 sm:basis-full" justify="end">
          <NavbarItem>
            <NextLink href="/login" className={clsx(linkStyles(), 'text-sm')}>
              Login
            </NextLink>
          </NavbarItem>
        </NavbarContent>
      )}
      <NavbarContent justify="end">
        <ThemeSwitch />
      </NavbarContent>
    </NextUINavbar>
  )
}

export default Navbar
