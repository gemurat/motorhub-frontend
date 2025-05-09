'use client'

import { title } from '@/components/primitives'
import { Card, CardBody, CardHeader } from '@nextui-org/card'
import { Divider } from '@nextui-org/divider'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/table'
import { Spinner } from '@nextui-org/spinner'
import { useQuery } from '@tanstack/react-query'
import { formatCurrency } from '../../utils/format'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import dynamic from 'next/dynamic'
import { Select, SelectItem } from '@nextui-org/select'
import React from 'react'

// Create a client-side chart component
const SalesChart = dynamic(() => import('./SalesChart'), { ssr: false })
const InventoryChart = dynamic(() => import('./InventoryChart'), { ssr: false })

interface Store {
  id: number
  name: string
}

async function getStores() {
  const response = await fetch('/api/admin/stores')
  if (!response.ok) {
    throw new Error('Failed to fetch stores')
  }
  return response.json()
}

async function getDashboardData(storeId: string) {
  try {
    if (!storeId) {
      throw new Error('No store selected')
    }

    const [salesRes, inventoryRes, cashboxRes, stockAlertsRes, recentOrdersRes] = await Promise.all([
      fetch(`/api/vendedor/sales?limit=10&storeId=${storeId}`),
      fetch(`/api/store-inventory?limit=10&storeId=${storeId}`),
      fetch(`/api/caja/cashboxes/current?storeId=${storeId}`),
      fetch(`/api/stock-alerts?limit=5&storeId=${storeId}`),
      fetch(`/api/caja/orders-in-review?storeId=${storeId}`)
    ])

    // Check if any request failed
    if (!salesRes.ok || !inventoryRes.ok || !cashboxRes.ok || !stockAlertsRes.ok || !recentOrdersRes.ok) {
      throw new Error('One or more API requests failed')
    }

    const [sales, inventory, cashbox, stockAlerts, recentOrders] = await Promise.all([
      salesRes.json(),
      inventoryRes.json(),
      cashboxRes.json(),
      stockAlertsRes.json(),
      recentOrdersRes.json()
    ])

    return {
      sales,
      inventory,
      cashbox,
      stockAlerts,
      recentOrders
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    throw error
  }
}

// Add TypeScript interfaces for our data
interface Sale {
  id: number
  created_at: string
  total_amount: number
  status: string
}

interface InventoryItem {
  id: number
  Products: {
    description: string
  }
  quantity: number
  status: string
}

interface Cashbox {
  current_balance: number
  last_updated: string
}

interface StockAlert {
  id: number
  Products: {
    description: string
  }
  type: string
  status: string
}

interface Order {
  id: number
  order_date: string
  total_amount: number
  status: string
}

interface DashboardData {
  sales: Sale[]
  inventory: InventoryItem[]
  cashbox: Cashbox
  stockAlerts: StockAlert[]
  recentOrders: {
    orders: Order[]
  }
}

function DashboardCard({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader className="flex gap-3 px-6 py-4">
        <h2 className="text-lg font-semibold">{title}</h2>
      </CardHeader>
      <Divider />
      <CardBody className="px-6 py-4">
        {children}
      </CardBody>
    </Card>
  )
}

export default function Dashboard() {
  const [selectedStore, setSelectedStore] = React.useState<string>('')

  // Fetch stores
  const { data: stores, isLoading: isLoadingStores } = useQuery<Store[]>({
    queryKey: ['stores'],
    queryFn: getStores
  })

  // Fetch dashboard data
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard', selectedStore],
    queryFn: () => getDashboardData(selectedStore),
    enabled: !!selectedStore
  })

  // Set initial store if available
  React.useEffect(() => {
    if (stores && stores.length > 0 && !selectedStore) {
      setSelectedStore(stores[0].id.toString())
    }
  }, [stores, selectedStore])

  if (isLoadingStores) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-danger">Error loading dashboard data</p>
      </div>
    )
  }

  // Prepare data for charts
  const salesChartData = data && Array.isArray(data.sales)
    ? data.sales.map((sale: any) => ({
      date: format(new Date(sale.created_at), 'dd/MM', { locale: es }),
      amount: Number(sale.total_amount)
    }))
    : []

  const inventoryChartData = data && Array.isArray(data.inventory)
    ? data.inventory.map((item: any) => ({
      name: item.Products?.description?.slice(0, 20) + '...',
      value: item.quantity
    }))
    : []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className={title({ size: 'lg' })}>Dashboard</h1>
          <Select
            label="Seleccionar Tienda"
            placeholder="Selecciona una tienda"
            variant="bordered"
            size="sm"
            className="max-w-[200px] bg-white"
            selectedKeys={[selectedStore]}
            onChange={(e) => setSelectedStore(e.target.value)}
          >
            {(stores || []).map((store) => (
              <SelectItem key={store.id.toString()} value={store.id.toString()}>
                {store.name}
              </SelectItem>
            ))}
          </Select>
        </div>

        {!selectedStore ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Por favor selecciona una tienda para ver el dashboard</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sales Overview */}
            <DashboardCard title="Ventas Recientes">
              <div className="h-[300px] mb-4">
                <SalesChart data={salesChartData} />
              </div>
              <Table
                aria-label="Recent sales"
                classNames={{
                  wrapper: "min-h-[200px]",
                }}
              >
                <TableHeader>
                  <TableColumn>Fecha</TableColumn>
                  <TableColumn>Total</TableColumn>
                  <TableColumn>Estado</TableColumn>
                </TableHeader>
                <TableBody>
                  {(data?.sales || []).map((sale: Sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{format(new Date(sale.created_at), 'dd/MM/yyyy', { locale: es })}</TableCell>
                      <TableCell>{formatCurrency(sale.total_amount)}</TableCell>
                      <TableCell>{sale.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DashboardCard>

            {/* Inventory Status */}
            <DashboardCard title="Estado de Inventario">
              <div className="h-[300px] mb-4">
                <InventoryChart data={inventoryChartData} />
              </div>
              <Table
                aria-label="Inventory status"
                classNames={{
                  wrapper: "min-h-[200px]",
                }}
              >
                <TableHeader>
                  <TableColumn>Producto</TableColumn>
                  <TableColumn>Stock</TableColumn>
                  <TableColumn>Estado</TableColumn>
                </TableHeader>
                <TableBody>
                  {(data?.inventory || []).map((item: InventoryItem) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.Products?.description}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DashboardCard>

            {/* Cash Box Status */}
            <DashboardCard title="Estado de Caja">
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Balance Actual</p>
                  <p className="text-2xl font-bold">{formatCurrency(data?.cashbox?.current_balance || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Última Actualización</p>
                  <p>{data?.cashbox?.last_updated ? format(new Date(data.cashbox.last_updated), 'dd/MM/yyyy HH:mm', { locale: es }) : '-'}</p>
                </div>
              </div>
            </DashboardCard>

            {/* Stock Alerts */}
            <DashboardCard title="Alertas de Stock">
              <Table
                aria-label="Stock alerts"
                classNames={{
                  wrapper: "min-h-[200px]",
                }}
              >
                <TableHeader>
                  <TableColumn>Producto</TableColumn>
                  <TableColumn>Tipo</TableColumn>
                  <TableColumn>Estado</TableColumn>
                </TableHeader>
                <TableBody>
                  {(data?.stockAlerts || []).map((alert: StockAlert) => (
                    <TableRow key={alert.id}>
                      <TableCell>{alert.Products?.description}</TableCell>
                      <TableCell>{alert.type}</TableCell>
                      <TableCell>{alert.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DashboardCard>

            {/* Recent Orders */}
            <DashboardCard title="Órdenes Recientes">
              <Table
                aria-label="Recent orders"
                classNames={{
                  wrapper: "min-h-[200px]",
                }}
              >
                <TableHeader>
                  <TableColumn>Fecha</TableColumn>
                  <TableColumn>Total</TableColumn>
                  <TableColumn>Estado</TableColumn>
                </TableHeader>
                <TableBody>
                  {(data?.recentOrders?.orders || []).map((order: Order) => (
                    <TableRow key={order.id}>
                      <TableCell>{format(new Date(order.order_date), 'dd/MM/yyyy', { locale: es })}</TableCell>
                      <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                      <TableCell>{order.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DashboardCard>
          </div>
        )}
      </div>
    </div>
  )
} 