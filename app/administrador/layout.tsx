export default function AdministradorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 w-full h-full">
      <div className="w-full h-full text-center">{children}</div>
    </section>
  )
}
