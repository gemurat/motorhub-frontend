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
import { useUser } from '@auth0/nextjs-auth0/client'

import { ThemeSwitch } from '@/components/theme-switch'
import { Logo } from '@/components/icons'
import Logout from '@/app/logout'

const Navbar = () => {
  const { user, error, isLoading } = useUser()
  console.log(user)

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>{error.message}</div>

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
              href="/inventario"
              className={clsx(linkStyles(), 'text-sm')}
            >
              Inventario
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
