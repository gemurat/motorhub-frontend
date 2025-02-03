import { getSession } from '@auth0/nextjs-auth0'
import { createAccessToken } from './createAccessToken'
import { query } from '@/db'

type Role = {
  id: number
  name: string
  description: string
}
type UserRoleData = {
  roles: Role[]
  caja?: number
}
export async function getUsersRoles() {
  const session = await getSession()
  const user = session?.user
  if (!user) {
    throw new Error('user not authenticated')
  }
  const token = await createAccessToken()
  const response = await fetch(
    `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/users/${user.sub}/roles`,
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  )
  const userResponse = await fetch(
    `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/users/${user.sub}`,
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  )
  const rolesData = await response.json()
  const userData = await userResponse.json()

  const data: UserRoleData = {
    roles: rolesData,
    caja: userData.caja,
  }

  return data as UserRoleData
}
