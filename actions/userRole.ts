import { getUsersRoles } from './getUsersRoles'

export async function userRole() {
  const userRole = await getUsersRoles()
  if (userRole.some((role) => role.name.toLocaleLowerCase() === 'vendedor')) {
    return 'vendedor'
  } else if (
    userRole.some((role) => role.name.toLocaleLowerCase() === 'admin')
  ) {
    return 'admin'
  } else if (
    userRole.some((role) => role.name.toLocaleLowerCase() === 'caja')
  ) {
    return 'caja'
  } else {
    return 'unknown'
  }
}
