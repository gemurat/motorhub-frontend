import { Metadata } from 'next'
import { DataTable } from './components/DataTable'
import { BatchTrackingProvider } from './components/BatchTrackingProvider'
import { BatchCreator } from './components/BatchCreator'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Batch Tracking',
  description: 'Track product batches and manage inventory',
}

export default async function BatchTrackingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Batch Tracking</h1>
        <Link
          href="/inventario"
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          Ver Inventario
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <BatchCreator />
        </div>
      </div>

      <BatchTrackingProvider>
        <DataTable />
      </BatchTrackingProvider>
    </div>
  )
}
