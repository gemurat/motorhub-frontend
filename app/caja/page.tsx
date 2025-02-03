import { withPageAuthRequired } from '@auth0/nextjs-auth0'
import OrderSection from '@/components/caja/Orders'
import { fetchMediosPago } from '../api/dataFetcher'

async function Caja() {
  const mediosPago = await fetchMediosPago()

  return (
    <>
      <div>
        <OrderSection mediosPago={mediosPago} />
      </div>
    </>
  )
}
export default withPageAuthRequired(Caja)
