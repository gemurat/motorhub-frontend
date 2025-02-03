import { getUsersRoles } from './getUsersRoles'
import { query } from '@/db'
import { getSession } from '@auth0/nextjs-auth0'

export async function userRole() {
  const session = await getSession()
  const userRole = await getUsersRoles()

  // Insert authenticated user data into the PostgreSQL database
  try {
    const result = await query(
      `SELECT * FROM public."Users" WHERE username = $1`,
      [session?.user.email]
    )
    if (
      result.rows.length === 0 &&
      userRole.caja !== undefined &&
      userRole.caja > 0
    ) {
      await query(
        `INSERT INTO public."Users" (username, role, caja) VALUES ($1, $2, $3)`,
        [session?.user.email, userRole.roles[0].name, userRole.caja]
      )
    } else if (result.rows.length === 0) {
      await query(
        `INSERT INTO public."Users" (username, role) VALUES ($1, $2)`,
        [session?.user.email, userRole.roles[0].name]
      )
    }
  } catch (error) {
    console.error(error)
  }

  if (
    userRole.roles.some((role) => role.name.toLocaleLowerCase() === 'vendedor')
  ) {
    return 'vendedor'
  } else if (
    userRole.roles.some((role) => role.name.toLocaleLowerCase() === 'admin')
  ) {
    return 'admin'
  } else if (
    userRole.roles.some((role) => role.name.toLocaleLowerCase() === 'caja')
  ) {
    return 'caja'
  } else {
    return 'unknown'
  }
}
