import Navbar from '@/components/navbar'
import { userRole } from '@/actions/userRole'

export default async function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const rolUser: any = await userRole()
  return (
    <section className="w-full flex flex-col items-center justify-center gap-4 ">
      <Navbar roleUser={rolUser ?? 'vendedor'} />
      {children}
    </section>
  )
}
