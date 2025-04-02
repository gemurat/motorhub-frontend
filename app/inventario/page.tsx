import TablaInventarioProductos from '@/components/inventario/TablaInventarioProductos'
import { withPageAuthRequired } from '@auth0/nextjs-auth0'

const exampleTable = [
  {
    id: '1',
    name: 'Macbook Pro M1 14" 512GB',
    sku: 'MAC-09485',
    category: 'Electronics',
    supplier: 'Urban Deals',
    stock: 20,
    stock_status: 'Low',
    unit_price: 1299,
    image: '/images/macbook.jpg',
  },
]

async function PricingPage() {
  return (
    <>
      <TablaInventarioProductos />
    </>
  )
}

export default withPageAuthRequired(PricingPage)
