import { getBrand } from './getBrand'
import { getCategory } from './getCategory'
import { getModels } from './getModel'
// import { getProducts } from "./getProducts"
import { getMediosPago } from './getMediosPago'

export const fetchBrands = async () => {
  return await getBrand()
}

export const fetchModels = async () => {
  return await getModels()
}

export const fetchCategory = async () => {
  return await getCategory()
}

export const fetchMediosPago = async () => {
  return await getMediosPago()
}
