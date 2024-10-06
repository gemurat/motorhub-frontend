import ProductTable from "@/components/ventas/ProductTable"
import { fetchProducts } from "../api/dataFetcher"

const Ventas = async () => {
  const produts = await fetchProducts()

  // console.log("category", category)
  // console.log("model", model)

  return (
    <div className="w-full">
      <ProductTable products={produts ?? [""]} />
    </div>
  )
}

export default Ventas
