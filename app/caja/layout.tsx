export default function CajaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex">
      {/* Sidebar will be added here */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
