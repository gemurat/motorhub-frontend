import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { StoreSelector } from './components/StoreSelector'
import { ProductManager } from '@/components/inventario/ProductManager'
import { InactiveProducts } from '@/components/inventario/InactiveProducts'
import { BrandManager } from '@/components/inventario/BrandManager'
import { ProductStockModal } from '@/components/inventario/ProductStockModal'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Inventario',
  description: 'Gestión de inventario',
}

type StoreStockInfo = {
  store_id: number
  store_name: string
  quantity: number
  min_stock: number | null
  max_stock: number | null
  reserved_quantity: number
  is_warehouse: boolean
  status: string
}

type MappedProduct = {
  id: number
  internal_code: string
  description: string | null
  price: number
  status: string
  store_stock: StoreStockInfo[]
  total_stock: number
  warehouse_stock: number
  selected_store_stock: number
  product_brand: string | null
  product_category: string | null
  last_movement: Date | null
}

type InventorySummary = {
  total_products: number
  low_stock_items: number
  out_of_stock_items: number
  total_stock_value: number
  total_reserved: number
  total_warehouse: number
  total_stores: number
  average_stock: number
}

type Store = {
  id: number
  name: string
  is_warehouse: boolean
}

async function getStores(): Promise<Store[]> {
  const stores = await prisma.store.findMany({
    select: {
      id: true,
      name: true,
      status: true,
    },
  })

  return stores.map((store) => ({
    id: store.id,
    name: store.name,
    is_warehouse: store.status === 'WAREHOUSE',
  }))
}

async function getProducts(
  storeId?: number
): Promise<{ summary: InventorySummary; products: MappedProduct[] }> {
  const products = await prisma.products.findMany({
    where: {
      status: 'ACTIVE',
    },
    include: {
      StoreInventory: {
        include: {
          Store: true,
        },
      },
      ProductBrands: true,
      ProductCategories: true,
      StockMovements: {
        orderBy: {
          created_at: 'desc',
        },
        take: 1,
      },
    },
  })

  let lowStockCount = 0
  let outOfStockCount = 0
  let totalStockValue = 0
  let totalProducts = 0
  let totalReserved = 0
  let totalWarehouse = 0
  let totalStores = 0
  let totalStockSum = 0

  const mappedProducts = products.map((product) => {
    const storeInventories = product.StoreInventory || []
    const lastMovement = product.StockMovements[0]?.created_at || null

    const storeStock: StoreStockInfo[] = storeInventories.map((inv) => ({
      store_id: inv.store_id,
      store_name: inv.Store.name,
      quantity: inv.quantity,
      min_stock: inv.min_stock,
      max_stock: inv.max_stock,
      reserved_quantity: inv.reserved_quantity,
      is_warehouse: inv.Store.status === 'WAREHOUSE',
      status: inv.status,
    }))

    const warehouseInventory = storeInventories.find(
      (inv) => inv.Store.status === 'WAREHOUSE'
    )

    const selectedStoreInventory = storeId
      ? storeInventories.find((inv) => inv.store_id === storeId)
      : null

    const totalStock = storeInventories.reduce(
      (sum: number, inv) => sum + inv.quantity,
      0
    )
    const totalReservedStock = storeInventories.reduce(
      (sum: number, inv) => sum + inv.reserved_quantity,
      0
    )
    const displayStock = selectedStoreInventory
      ? selectedStoreInventory.quantity
      : totalStock
    const productPrice = Number(product.price || 0)
    const productValue = productPrice * displayStock

    // Update summary statistics
    totalStockSum += totalStock
    totalReserved += totalReservedStock
    totalWarehouse += warehouseInventory?.quantity || 0
    totalStores += storeInventories.length

    // Only count products that have stock in the selected store
    if (storeId) {
      if (selectedStoreInventory) {
        totalProducts++
        if (selectedStoreInventory.quantity === 0) {
          outOfStockCount++
        } else if (selectedStoreInventory.quantity < 10) {
          lowStockCount++
        }
        totalStockValue += productValue
      }
    } else {
      // Count all products when no store is selected
      totalProducts++
      if (totalStock === 0) {
        outOfStockCount++
      } else if (totalStock < 10) {
        lowStockCount++
      }
      totalStockValue += productValue
    }

    return {
      id: product.id,
      internal_code: product.internal_code || '',
      description: product.description,
      price: productPrice,
      status: product.status,
      store_stock: storeStock,
      total_stock: totalStock,
      warehouse_stock: warehouseInventory?.quantity || 0,
      selected_store_stock: selectedStoreInventory?.quantity || 0,
      product_brand: product.ProductBrands?.name || null,
      product_category: product.ProductCategories?.name || null,
      last_movement: lastMovement,
    }
  })

  const summary: InventorySummary = {
    total_products: totalProducts,
    low_stock_items: lowStockCount,
    out_of_stock_items: outOfStockCount,
    total_stock_value: totalStockValue,
    total_reserved: totalReserved,
    total_warehouse: totalWarehouse,
    total_stores: totalStores,
    average_stock:
      totalProducts > 0 ? Math.round(totalStockSum / totalProducts) : 0,
  }

  return { summary, products: mappedProducts }
}

export default async function InventarioPage({
  searchParams,
}: {
  searchParams: { storeId?: string; productId?: string }
}) {
  const storeId = searchParams.storeId
    ? parseInt(searchParams.storeId)
    : undefined
  const productId = searchParams.productId
    ? parseInt(searchParams.productId)
    : undefined
  const { summary, products } = await getProducts(storeId)
  const stores = await getStores()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Inventario</h1>
        <Link
          href="/batch-tracking"
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          Ver Lotes
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <StoreSelector stores={stores} selectedStoreId={storeId} />
        <div className="flex gap-2">
          <InactiveProducts />
          <ProductManager />
          <BrandManager />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Productos</h3>
          <p className="text-3xl font-bold text-gray-900">
            {summary.total_products}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">
            Productos con Stock Bajo
          </h3>
          <p className="text-3xl font-bold text-yellow-600">
            {summary.low_stock_items}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">
            Productos Sin Stock
          </h3>
          <p className="text-3xl font-bold text-red-600">
            {summary.out_of_stock_items}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">
            Valor Total del Inventario
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            ${summary.total_stock_value.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Stock Reservado</h3>
          <p className="text-3xl font-bold text-blue-600">
            {summary.total_reserved}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Stock en Bodega</h3>
          <p className="text-3xl font-bold text-green-600">
            {summary.total_warehouse}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Tiendas Activas</h3>
          <p className="text-3xl font-bold text-purple-600">
            {summary.total_stores}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Stock Promedio</h3>
          <p className="text-3xl font-bold text-indigo-600">
            {summary.average_stock}
          </p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Marca
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock {storeId ? 'en Tienda' : 'Total'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reservado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mínimo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Máximo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Último Movimiento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => {
              const selectedStoreStock = storeId
                ? product.store_stock.find(
                    (stock) => stock.store_id === storeId
                  )
                : null

              const minStock = selectedStoreStock?.min_stock ?? 0
              const maxStock = selectedStoreStock?.max_stock ?? null
              const currentStock = storeId
                ? product.selected_store_stock
                : product.total_stock
              const reservedStock = selectedStoreStock?.reserved_quantity ?? 0

              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      <Link
                        href={`/inventario?productId=${product.id}${
                          storeId ? `&storeId=${storeId}` : ''
                        }`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {product.internal_code}
                      </Link>
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.product_brand || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.product_category || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {currentStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reservedStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {minStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {maxStock ?? '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.last_movement
                      ? new Date(product.last_movement).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <ProductManager product={product} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Product Stock Modal */}
      <ProductStockModal />
    </div>
  )
}
