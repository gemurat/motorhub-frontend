'use client'

import { useRouter } from 'next/navigation'

type Store = {
  id: number
  name: string
  is_warehouse: boolean
}

type StoreSelectorProps = {
  stores: Store[]
  selectedStoreId?: number
}

export function StoreSelector({ stores, selectedStoreId }: StoreSelectorProps) {
  const router = useRouter()

  const handleStoreChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const storeId = event.target.value
    const url =
      storeId === 'all' ? '/inventario' : `/inventario?storeId=${storeId}`
    router.push(url)
  }

  return (
    <select
      className="block w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      value={selectedStoreId?.toString() || 'all'}
      onChange={handleStoreChange}
    >
      <option value="all">Todas las tiendas</option>
      {stores.map((store) => (
        <option key={store.id} value={store.id}>
          {store.name} {store.is_warehouse ? '(Bodega)' : ''}
        </option>
      ))}
    </select>
  )
}
