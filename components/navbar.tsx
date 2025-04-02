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

const navBarItems = {
  caja: ['ventas', 'reportes'],
  vendedor: ['ventas'],
  admin: ['ventas', 'caja', 'inventario', 'reportes', 'administrador'],
}

type RoleUser = keyof typeof navBarItems

const Navbar = ({ roleUser = 'vendedor' }: { roleUser: RoleUser }) => {
  const { user, error, isLoading } = useUser()
  console.log(navBarItems[roleUser])

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
          {navBarItems[roleUser].map((item) => (
            <NavbarItem key={item}>
              <NextLink
                href={`/${item}`}
                className={clsx(linkStyles(), 'text-sm', 'text-white')}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </NextLink>
            </NavbarItem>
          ))}
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
