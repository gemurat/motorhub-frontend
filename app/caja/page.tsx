import { withPageAuthRequired } from '@auth0/nextjs-auth0'
import CashRegister from '@/components/caja/CashRegister'

async function CajaPage() {
  return (
    <main className="flex min-h-screen flex-col bg-gray-100">
      <div className="flex-1 p-4">
        <CashRegister />
      </div>
    </main>
  )
}

export default withPageAuthRequired(CajaPage)
