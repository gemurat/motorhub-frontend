import { getSession } from '@auth0/nextjs-auth0'

export const getAuthSession = async () => {
  const session = await getSession()
  return session
}
