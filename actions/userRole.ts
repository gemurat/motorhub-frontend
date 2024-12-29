import { getUsersRoles } from './getUsersRoles'

export async function userRole() {
  const userRole = await getUsersRoles()
  if (userRole.some((role) => role.name === 'vendedor')) {
    return 'vendedor'
  } else if (userRole.some((role) => role.name === 'admin')) {
    return 'admin'
  } else if (userRole.some((role) => role.name === 'caja')) {
    return 'caja'
  } else {
    return 'unknown'
  }
}
