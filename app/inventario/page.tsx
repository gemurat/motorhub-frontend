import { withPageAuthRequired } from '@auth0/nextjs-auth0'

async function PricingPage() {
  return (
    <div>
      <h1>Inventario</h1>
    </div>
  )
}
export default withPageAuthRequired(PricingPage)
