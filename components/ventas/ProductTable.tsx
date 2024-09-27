import React from "react"
interface Product {
  id: number
  precio1: number
  marcaid: number
  modeloid: number
  ano: number
  anoDesplegado: number
  minimo: number
  maximo: number
  costo: number
  parte: string
  familiaid: number
  existencia: number
  marca: string
  moneda: string
  modelo: string
}

interface ProductTableProps {
  products?: Product[]
}

const ProductTable: React.FC<ProductTableProps> = ({ products = [] }) => {
  if (!Array.isArray(products)) {
    return <div>Error: products is not an array</div>
  }

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Precio</th>
          <th>Marca ID</th>
          <th>Modelo ID</th>
          <th>Año</th>
          <th>Año Desplegado</th>
          <th>Mínimo</th>
          <th>Máximo</th>
          <th>Costo</th>
          <th>Parte</th>
          <th>Familia ID</th>
          <th>Existencia</th>
          <th>Marca</th>
          <th>Moneda</th>
          <th>Modelo</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id}>
            <td>{product.id}</td>
            <td>{product.precio1}</td>
            <td>{product.marcaid}</td>
            <td>{product.modeloid}</td>
            <td>{product.ano}</td>
            <td>{product.anoDesplegado}</td>
            <td>{product.minimo}</td>
            <td>{product.maximo}</td>
            <td>{product.costo}</td>
            <td>{product.parte}</td>
            <td>{product.familiaid}</td>
            <td>{product.existencia}</td>
            <td>{product.marca}</td>
            <td>{product.moneda}</td>
            <td>{product.modelo}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default ProductTable
