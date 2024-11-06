import { title } from "@/components/primitives"
import { fetchVentas } from "../api/dataFetcher"
import { DonutChartLabelExample } from "@/components/reportes/MainReportes"

export default function AboutPage() {
  const getVentasData = async (startDate?: string, endDate?: string) => {
    try {
      const data = await fetchVentas()
      return data
    } catch (error) {
      console.error("Error fetching ventas data:", error)
      return null
    }
  }
  console.log(getVentasData())

  return (
    <div>
      <h1 className={title()}>reportes</h1>
      <DonutChartLabelExample />
    </div>
  )
}
