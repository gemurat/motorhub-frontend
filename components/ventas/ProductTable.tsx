// 'use client'
// import React, { useState, useMemo, useEffect } from 'react'
// import {
//   Modal,
//   ModalContent,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   Button,
//   useDisclosure,
// } from '@nextui-org/react'
// import { PlusIcon } from '@/public/plusIcon'
// import {
//   Table,
//   TableHeader,
//   TableColumn,
//   TableBody,
//   TableRow,
//   TableCell,
//   Pagination,
//   getKeyValue,
//   Input,
// } from '@nextui-org/react'
// // import LazySelect from "./LazySelect"
// import ShoppingCart from './ShoppingCart'
// import { SearchIcon } from '@/public/searchIcon'

// interface Product {
//   marcaid: any
//   modeloid: any
//   familiaid: any
//   id: string
//   modelo: string
//   ano: number
//   parte: string
//   marca: string
//   existencia: number
//   precio1: number
//   moneda: string
//   cantidad?: number
//   measurements: string
//   supplierCode: string
//   originalCode: string
// }

// interface ProductTableProps {
//   // products: Product[]
//   // onProductSelect: (product: string) => void
// }

// interface FilterVal {
//   id: any
//   value: string
//   label: string
//   identifier: string
// }

// const ProductTable: React.FC<ProductTableProps> = () => {
//   const [products, setProducts] = useState<Product[]>([])
//   const [semejantes, setSemejantes] = useState<any>([])
//   const [semejanteData, setSemejanteData] = useState<any>([])
//   const [filterValue, setFilterValue] = useState('')
//   const { isOpen, onOpen, onOpenChange } = useDisclosure()
//   const [addedProducts, setAddedProducts] = useState<Product[]>([])
//   const [idFilterValue, setIdFilterValue] = useState('')

//   const handleAddProduct = (product: Product) => {
//     setAddedProducts(prevProducts => {
//       const existingProduct = prevProducts.find(p => p.id === product.id)
//       if (existingProduct) {
//         return prevProducts.map(p =>
//           p.id === product.id ? { ...p, cantidad: (p.cantidad || 1) + 1 } : p
//         )
//       } else {
//         return [...prevProducts, { ...product, cantidad: 1 }]
//       }
//     })
//   }
//   const [loading, setLoading] = useState(false)

//   useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true)
//       try {
//         const response = await fetch('api/productos')
//         const data = await response.json()
//         // console.log(products)

//         setProducts(data)
//       } catch (error) {
//         console.error('Error fetching products:', error)
//       } finally {
//         setLoading(false)
//       }
//     }
//     const fetchSemejanteData = async () => {
//       if (semejantes.length > 0) {
//         setLoading(true)
//         try {
//           const response = await fetch(
//             `api/semejantes?semejanteId=${semejantes}`
//           )
//           const data = await response.json()
//           setSemejanteData(data)
//         } catch (error) {
//           console.error('Error fetching semejante data:', error)
//         } finally {
//           setLoading(false)
//         }
//       }
//     }
//     fetchSemejanteData()
//   }, [semejantes])

//   useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true)
//       try {
//         const response = await fetch('api/productos')
//         const data = await response.json()
//         setProducts(data)
//       } catch (error) {
//         console.error('Error fetching products:', error)
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetchProducts()
//   }, [])
//   const handleFetchSemejante = (id: string) => {
//     setSemejantes(id)
//     onOpen()
//   }
//   const handleRemoveProduct = (id: string) => {
//     setAddedProducts(prevProducts => {
//       return prevProducts
//         .map(p =>
//           p.id.toString() === id ? { ...p, cantidad: (p.cantidad || 1) - 1 } : p
//         )
//         .filter(p => p.cantidad !== 0)
//     })
//   }

//   const onClear = React.useCallback(() => {
//     setFilterValue('')
//     setPage(1)
//   }, [])

//   const normalizeQuery = (query: any) => {
//     return query.toLowerCase().split(' ').filter(Boolean)
//   }
//   const filterProducts = (
//     products: Product[],
//     query: string,
//     idQuery: string
//   ): Product[] => {
//     const queryParts: string[] = normalizeQuery(query)
//     return products.filter((product: Product) => {
//       const searchableText: string =
//         `${product.modelo} ${product.parte} ${product.marca} ${product.supplierCode} ${product.originalCode}`.toLowerCase()
//       const matchesQuery = queryParts.every(part =>
//         searchableText.includes(part)
//       )
//       const matchesId = idQuery
//         ? product.id?.toLowerCase().includes(idQuery.toLowerCase())
//         : true
//       return matchesQuery && matchesId
//     })
//   }

//   const filteredProducts = useMemo(() => {
//     return filterProducts(products, filterValue, idFilterValue)
//   }, [products, filterValue, idFilterValue])

//   const [page, setPage] = React.useState(1)
//   const rowsPerPage = 7

//   const pages =
//     filteredProducts.length > 0
//       ? Math.ceil(filteredProducts.length / rowsPerPage)
//       : 0

//   const items = useMemo(() => {
//     const start = (page - 1) * rowsPerPage
//     const end = start + rowsPerPage
//     return filteredProducts.slice(start, end)
//   }, [page, filteredProducts])

//   const onSearchChange = React.useCallback((value?: string) => {
//     if (value) {
//       setFilterValue(value)
//       setPage(1)
//     } else {
//       setFilterValue('')
//     }
//   }, [])

//   const onIdSearchChange = (value: string) => {
//     setIdFilterValue(value)
//     setPage(1)
//   }
//   // console.log(semejanteData)

//   return (
//     products.length > 0 && (
//       <div>
//         <div className="flex gap-4">
//           <div className="w-[200px]">
//             <Input
//               fullWidth={false}
//               isClearable
//               className="w-full"
//               placeholder="Buscar por ID..."
//               startContent={<SearchIcon />}
//               value={idFilterValue}
//               onClear={() => onIdSearchChange('')}
//               onValueChange={onIdSearchChange}
//             />
//           </div>
//           <Input
//             isClearable
//             className="w-full sm:max-w-[44%]"
//             placeholder="Buscar..."
//             startContent={<SearchIcon />}
//             value={filterValue}
//             onClear={() => onClear()}
//             onValueChange={onSearchChange}
//           />
//         </div>
//         <Table
//           className="mt-5"
//           aria-label="Product table with client side pagination"
//           bottomContent={
//             <div className="flex w-full justify-center">
//               <Pagination
//                 isCompact
//                 showControls
//                 showShadow
//                 color="secondary"
//                 page={page}
//                 total={pages}
//                 onChange={page => setPage(page)}
//               />
//             </div>
//           }
//           classNames={{
//             wrapper: 'min-h-[550px]',
//           }}
//         >
//           <TableHeader>
//             <TableColumn key="id">Parte</TableColumn>
//             <TableColumn key="marca">Marca</TableColumn>
//             <TableColumn key="modelo">Modelo</TableColumn>
//             <TableColumn key="measurements">Medidas</TableColumn>
//             <TableColumn key="ano">Año</TableColumn>
//             <TableColumn key="precio1">Precio</TableColumn>
//             <TableColumn key="existencia">Existencia</TableColumn>
//             <TableColumn key="parte">Parte</TableColumn>
//             <TableColumn key="supplierCode">Codigo Proveedor</TableColumn>
//             <TableColumn key="originalCode">Codigo Original</TableColumn>
//             <TableColumn key="action"> </TableColumn>
//           </TableHeader>
//           <TableBody>
//             {items.map((item, index) => (
//               <TableRow
//                 key={`${item.id}-${index}`}
//                 className={`h-16 ${item.existencia === 0 ? 'opacity-50' : ''}`}
//               >
//                 <TableCell>
//                   <button onClick={() => handleFetchSemejante(item.id)}>
//                     {item.id}
//                   </button>
//                 </TableCell>
//                 <TableCell>{item.marca}</TableCell>
//                 <TableCell>{item.modelo}</TableCell>
//                 <TableCell>{item.measurements}</TableCell>
//                 <TableCell>{item.ano}</TableCell>
//                 <TableCell>
//                   {new Intl.NumberFormat('en-US', {
//                     style: 'currency',
//                     currency: 'CLP',
//                   }).format(item.precio1)}
//                 </TableCell>
//                 <TableCell>{item.existencia}</TableCell>
//                 <TableCell>{item.parte}</TableCell>
//                 <TableCell>{item.supplierCode}</TableCell>
//                 <TableCell>{item.originalCode}</TableCell>
//                 <TableCell>
//                   <button
//                     onClick={() => handleAddProduct(item)}
//                     disabled={item.existencia === 0}
//                   >
//                     <PlusIcon />
//                   </button>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>

//         <Modal
//           scrollBehavior="inside"
//           size="5xl"
//           isOpen={isOpen}
//           onOpenChange={onOpenChange}
//         >
//       </div>
//     )
//   )
// }

// export default ProductTable
