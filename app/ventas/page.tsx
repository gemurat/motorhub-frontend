import TableNew from '@/components/ventas/TableNew'
// import ProductTable from "@/components/ventas/ProductTable"
// import { fetchProducts } from "../api/dataFetcher"

const Ventas = async () => {
  // const produts = await fetchProducts()

  return (
    <div className="w-full">
      {/* <ProductTable /> */}
      <TableNew />
    </div>
  )
}

export default Ventas
