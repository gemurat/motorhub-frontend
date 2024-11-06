import { getBrand } from "./getBrand"
import { getCategory } from "./getCategory"
import { getModels } from "./getModel"
import { getProducts } from "./getProducts"
import { getVentas } from "./getVentas"

export const fetchBrands = async () => {
  return await getBrand()
}

export const fetchModels = async () => {
  return await getModels()
}

export const fetchCategory = async () => {
  return await getCategory()
}

export const fetchProducts = async () => {
  return await getProducts()
}
export const fetchVentas = async (startDate?: string, endDate?: string) => {
  return await getVentas(startDate, endDate)
}
