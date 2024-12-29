import { userRole } from '@/actions/userRole'
import { withPageAuthRequired } from '@auth0/nextjs-auth0'
import { redirect } from 'next/navigation'

async function PricingPage() {
  const roleUser = await userRole()
  if (roleUser !== 'admin') {
    return redirect('/inicio')
  }
  return (
    <div>
      <h1>Inventario</h1>
    </div>
  )
}
export default withPageAuthRequired(PricingPage)
