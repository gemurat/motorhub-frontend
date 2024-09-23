import FilterDrawer from "@/components/ventas/FilterDrawer"
import { getBrand } from "../api/getBrand"

interface Brand {
  id: number
  name: string
}

const DocsPage = async () => {
  const brands = await getBrand()
  // console.log("brands", brands)

  return (
    <div className="w-full">
      <FilterDrawer
        filterVal={brands}
        label="Marca"
        placeholder="Seleccione Marca"
      />
    </div>
  )
}

export default DocsPage
