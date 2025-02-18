import { withPageAuthRequired } from '@auth0/nextjs-auth0'
import { fetchMediosPago } from '../api/dataFetcher'
import MainSection from '@/components/administrador/MainView'

async function Administrador() {
  const mediosPago = await fetchMediosPago()

  return (
    <>
      <div>
        <MainSection mediosPago={mediosPago} />
      </div>
    </>
  )
}
export default withPageAuthRequired(Administrador)
