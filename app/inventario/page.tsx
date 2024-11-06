import {
  fetchBrands,
  fetchModels,
  fetchProducts,
  fetchCategory,
} from "../api/dataFetcher"
import TablaInventarioProductos from "@/components/inventario/TablaInventarioProductos"

const PricingPage = async () => {
  const brands = await fetchBrands()
  const model = await fetchModels()
  const category = await fetchCategory()
  const produts = await fetchProducts()

  // console.log("category", category)
  // console.log("model", model)

  return (
    <div className="w-full">
      {/* products table */}
      <TablaInventarioProductos
        products={produts ?? [""]}
        isShoppingCart={false}
      />
    </div>
  )
}
export default PricingPage
