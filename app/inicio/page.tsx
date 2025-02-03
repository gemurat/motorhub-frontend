import { Link } from '@nextui-org/link'
import { button as buttonStyles } from '@nextui-org/theme'
import { title, subtitle } from '@/components/primitives'
import { withPageAuthRequired } from '@auth0/nextjs-auth0'
import { getSession } from '@auth0/nextjs-auth0'
import { redirect } from 'next/navigation'
import { userRole } from '@/actions/userRole'
async function Home() {
  const session = await getSession()
  if (!session) {
    return redirect('/error')
  }
  const user = session?.user
  const roleUser = await userRole()
  // console.log(roleUser)
  if (roleUser === 'caja') {
    redirect('/caja')
  }
  if (roleUser === 'vendedor') {
    redirect('/ventas')
  }
  return (
    <section className="flex flex-col items-center justify-center gap-8 py-12 md:py-16">
      <div className="inline-block max-w-xl text-center">
        <h1 className={title()}>Bienvenido!</h1>
        <h2 className={subtitle({ class: 'mt-4' })}>
          {user?.name || 'Invitado'} Navega hacia el modulo que necesites.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="p-8 h-56 border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-2xl font-semibold">Ventas</h3>
          <p className="mt-4 text-base">Manage and track your sales data.</p>
          <Link
            className={buttonStyles({
              color: 'primary',
              radius: 'full',
              variant: 'shadow',
              class: 'mt-6',
            })}
            href="/ventas"
          >
            Go to Ventas
          </Link>
        </div>
        <div className="p-8 h-56 border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-2xl font-semibold">Reportes</h3>
          <p className="mt-4 text-base">Generate and view detailed reports.</p>
          <Link
            className={buttonStyles({
              variant: 'bordered',
              radius: 'full',
              class: 'mt-6',
            })}
            href="/reportes"
          >
            Go to Reportes
          </Link>
        </div>
        {roleUser === 'admin' && (
          <>
            <div className="p-8 h-56 border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-2xl font-semibold">Inventario</h3>
              <p className="mt-4 text-base">
                Keep track of your inventory levels.
              </p>
              <Link
                className={buttonStyles({
                  variant: 'bordered',
                  radius: 'full',
                  class: 'mt-6',
                })}
                href="/inventario"
              >
                Go to Inventario
              </Link>
            </div>
            <div className="p-8 h-56 border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-2xl font-semibold">Finanzas</h3>
              <p className="mt-4 text-base">
                Manage your financial data and transactions.
              </p>
              <Link
                className={buttonStyles({
                  variant: 'bordered',
                  radius: 'full',
                  class: 'mt-6',
                })}
                href="/finanzas"
              >
                Go to Finanzas
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default withPageAuthRequired(Home)
