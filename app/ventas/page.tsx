import { withPageAuthRequired } from '@auth0/nextjs-auth0'
import TableNew from '@/components/ventas/TableNew'

const Ventas = async () => {
  return (
    <div className="w-full">
      <TableNew />
    </div>
  )
}

export default withPageAuthRequired(Ventas)
