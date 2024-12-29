import { getSession } from '@auth0/nextjs-auth0'
import { createAccessToken } from './createAccessToken'

type Role = {
  id: number
  name: string
  description: string
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
  const data = await response.json()
  return data as Role[]
}
