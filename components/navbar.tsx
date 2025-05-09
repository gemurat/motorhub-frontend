'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSessionContext } from '@/contexts/SessionContext'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useEffect, useState } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  LogOut,
  Menu,
  X,
  Home,
  ShoppingCart,
  Package,
  CreditCard,
  DollarSign,
  BarChart2,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
}

const navigation: NavigationItem[] = [
  { name: 'Inicio', href: '/inicio', icon: Home, roles: ['admin'] },
  { name: 'Caja', href: '/caja', icon: CreditCard, roles: ['admin', 'cajero'] },
  {
    name: 'Ventas',
    href: '/ventas',
    icon: ShoppingCart,
    roles: ['admin', 'vendedor', 'cajero'],
  },
  {
    name: 'Inventario',
    href: '/inventario',
    icon: Package,
    roles: ['admin', 'cajero'],
  },
  { name: 'Finanzas', href: '/finanzas', icon: DollarSign, roles: ['admin'] },
  { name: 'Reportes', href: '/reportes', icon: BarChart2, roles: ['admin'] },
  {
    name: 'Administrador',
    href: '/administrador',
    icon: Settings,
    roles: ['admin'],
  },
]

interface NavbarProps {
  children: React.ReactNode
}

// Function to get the Spanish name for the role
const getRoleName = (role: string | null) => {
  switch (role) {
    case 'admin':
      return 'Administrador'
    case 'vendedor':
      return 'Vendedor'
    case 'cajero':
      return 'Cajero'
    default:
      return 'Usuario'
  }
}

export default function Navbar({ children }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, role } = useSessionContext()
  const [isCollapsed, setIsCollapsed] = useState(true)

  useEffect(() => {}, [role, user])

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={cn(
          'bg-background border-r transition-all duration-300 flex flex-col',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="p-4 flex justify-between items-center">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-foreground">MotorHub</h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-accent"
          >
            {isCollapsed ? (
              <Menu className="h-5 w-5" />
            ) : (
              <X className="h-5 w-5" />
            )}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4">
          {navigation
            .filter((item) => {
              if (!role) return false
              return item.roles.includes(role.toLowerCase())
            })
            .map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-lg mb-2 transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {!isCollapsed && (
                    <span className="ml-3 text-sm font-medium">
                      {item.name}
                    </span>
                  )}
                </Link>
              )
            })}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div
              className={cn('flex items-center', isCollapsed ? 'hidden' : '')}
            >
              <span className="text-sm text-muted-foreground">
                {user?.name} - {getRoleName(role)}
              </span>
            </div>
            <ThemeToggle />
          </div>
          <button
            onClick={() => {
              // Clear all storage
              localStorage.clear()
              sessionStorage.clear()

              // Clear all cookies
              document.cookie.split(';').forEach((cookie) => {
                const [name] = cookie.split('=')
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
              })

              // Force a hard redirect to the Auth0 logout endpoint
              window.location.href = `/api/auth/logout?returnTo=${encodeURIComponent('/')}`
            }}
            className={cn(
              'flex items-center mt-4 text-muted-foreground hover:text-foreground w-full',
              isCollapsed ? 'justify-center' : 'space-x-2'
            )}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span className="text-sm">Cerrar Sesión</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
