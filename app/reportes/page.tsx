import { title } from '@/components/primitives'
import { fetchVentas } from '../api/dataFetcher'
import { withPageAuthRequired } from '@auth0/nextjs-auth0'

async function AboutPage() {
  const getVentasData = async (startDate?: string, endDate?: string) => {
    try {
      const data = await fetchVentas()
      return data
    } catch (error) {
      console.error('Error fetching ventas data:', error)
      return null
    }
  }
  console.log(getVentasData())

  return (
    <div>
      <h1 className={title()}>reportes</h1>
      {/* <DonutChartLabelExample /> */}
    </div>
  )
}

export default withPageAuthRequired(AboutPage)
