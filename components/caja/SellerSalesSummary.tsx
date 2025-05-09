import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface SellerSales {
  seller_name: string
  total_sales: number
  order_count: number
  average_order_value: number
}

interface SellerSalesSummaryProps {
  storeId: string
  cashboxId: string
}

export default function SellerSalesSummary({ storeId, cashboxId }: SellerSalesSummaryProps) {
  const { data: sellerSales, isLoading } = useQuery({
    queryKey: ['seller-sales-summary', storeId, cashboxId],
    queryFn: async () => {
      const response = await fetch(`/api/caja/seller-sales-summary?storeId=${storeId}&cashboxId=${cashboxId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch seller sales summary')
      }
      const data = await response.json()
      return data as SellerSales[]
    },
    enabled: !!storeId && !!cashboxId,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Resumen Ventas Vendedor</h3>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-500 mb-2">
          <span>Vendedor</span>
          <span className="text-right">Total Ventas</span>
          <span className="text-right">Cantidad Órdenes</span>
          <span className="text-right">Promedio por Orden</span>
        </div>
        <div className="space-y-2">
          {sellerSales?.map((seller) => (
            <div
              key={seller.seller_name}
              className="grid grid-cols-4 gap-4 items-center"
            >
              <span className="font-medium">{seller.seller_name}</span>
              <span className="text-right">
                {new Intl.NumberFormat('es-AR', {
                  style: 'currency',
                  currency: 'ARS',
                }).format(seller.total_sales)}
              </span>
              <span className="text-right">{seller.order_count}</span>
              <span className="text-right">
                {new Intl.NumberFormat('es-AR', {
                  style: 'currency',
                  currency: 'ARS',
                }).format(seller.average_order_value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
