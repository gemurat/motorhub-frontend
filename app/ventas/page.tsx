import FilterDrawer from "@/components/ventas/FilterDrawer"
import ProductTable from "@/components/ventas/ProductTable"
import {
  fetchBrands,
  fetchModels,
  fetchProducts,
  fetchCategory,
} from "../api/dataFetcher"

const DocsPage = async () => {
  const brands = await fetchBrands()
  const model = await fetchModels()
  const category = await fetchCategory()
  const produts = await fetchProducts()
  console.log(produts)

  // console.log("category", category)
  // console.log("model", model)

  return (
    <div className="w-full">
      {/* products table */}
      <ProductTable
        products={produts ?? [""]}
        brands={brands}
        model={model}
        category={category}
      />
    </div>
  )
}

export default DocsPage
