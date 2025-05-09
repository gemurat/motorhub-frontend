'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Store, Users } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const menuItems = [
    {
      title: 'Dashboard',
      href: '/administrador',
      icon: LayoutDashboard,
    },
    {
      title: 'Tiendas',
      href: '/administrador/tiendas',
      icon: Store,
    },
    {
      title: 'Empleados',
      href: '/administrador/empleados',
      icon: Users,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Tabs */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group inline-flex items-center px-3 py-2 text-sm font-medium transition-colors relative',
                    isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.title}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
