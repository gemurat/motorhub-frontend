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
  try {
    const session = await getSession()
    const user = session?.user
    if (!user) {
      console.error('No authenticated user found in session')
      throw new Error('user not authenticated')
    }

    const token = await createAccessToken()
    if (!token) {
      console.error('Failed to create access token')
      throw new Error('Failed to create access token')
    }

    // Fetch roles and user data in parallel
    const [rolesResponse, userResponse] = await Promise.all([
      fetch(
        `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/users/${user.sub}/roles`,
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      ),
      fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/users/${user.sub}`, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }),
    ])

    if (!rolesResponse.ok) {
      const errorText = await rolesResponse.text()
      console.error('Failed to fetch roles:', {
        status: rolesResponse.status,
        statusText: rolesResponse.statusText,
        error: errorText,
        url: rolesResponse.url,
      })
      throw new Error(
        `Failed to fetch roles: ${rolesResponse.status} ${rolesResponse.statusText}`
      )
    }

    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error('Failed to fetch user data:', {
        status: userResponse.status,
        statusText: userResponse.statusText,
        error: errorText,
        url: userResponse.url,
      })
      throw new Error(
        `Failed to fetch user data: ${userResponse.status} ${userResponse.statusText}`
      )
    }

    const rolesData = await rolesResponse.json()
    const userData = await userResponse.json()

    if (!Array.isArray(rolesData)) {
      console.error('Invalid roles data format:', rolesData)
      throw new Error('Invalid roles data format')
    }

    const data: UserRoleData = {
      roles: rolesData,
      caja: userData.caja,
    }

    return data
  } catch (error) {
    console.error('Error in getUsersRoles:', error)
    throw error
  }
}
