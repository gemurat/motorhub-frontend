export function formatCurrency(
  value: number | string | null | undefined
): string {
  if (value === null || value === undefined) return '$0.00'
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(numValue)
}
