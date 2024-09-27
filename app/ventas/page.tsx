import FilterDrawer from "@/components/ventas/FilterDrawer"
import { getBrand } from "../api/getBrand"
import { getModels } from "../api/getModel"
import { getCategory } from "../api/getCategory"
import { getProducts } from "../api/getProducts"
import ProductTable from "@/components/ventas/ProductTable"

interface Brand {
  id: number
  name: string
}

const DocsPage = async () => {
  const brands: Brand[] = await getBrand()
  const model = await getModels()
  const category = await getCategory()
  const produts = await getProducts()
  console.log(produts)

  // console.log("category", category)
  // console.log("model", model)

  return (
    <div className="w-full">
      <div className="w-full inline-flex gap-5">
        <p>Filtros:</p>
        <FilterDrawer label="marcas" filterVal={brands} />
        <FilterDrawer label="modelos" filterVal={model} />
        <FilterDrawer label="categoria" filterVal={category} />
      </div>
      <div className="w-full">
        products table
        <ProductTable products={produts ?? [""]} />
      </div>
    </div>
  )
}

export default DocsPage
