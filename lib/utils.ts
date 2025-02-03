export function capitalizeFirstLetter(val: string) {
  if (!val) return ''
  return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()
}
export function formatCurrency(value: string) {
  const numberValue = parseFloat(value)
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(numberValue)
}
