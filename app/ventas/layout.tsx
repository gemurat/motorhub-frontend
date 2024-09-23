export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-initial">
      <div className="max-w-lg text-center justify-center">{children}</div>
    </section>
  )
}
