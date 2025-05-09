import { withPageAuthRequired } from '@auth0/nextjs-auth0'
import TableNew from '@/components/ventas/TableNew'
import ShoppingCart from '@/components/ventas/ShoppingCart'
import { Suspense } from 'react'
import VentasClient from '@/components/ventas/VentasClient'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Ventas',
  description: 'Gestión de ventas',
}

const Ventas = async () => {
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Ventas</h1>
          <Link
            href="/inventario"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Ver Inventario
          </Link>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              }
            >
              <VentasClient />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withPageAuthRequired(Ventas)
