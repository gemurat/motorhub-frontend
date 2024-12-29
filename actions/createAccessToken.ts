export async function createAccessToken() {
  try {
    const url = `${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`
    const clientId = process.env.AUTH0_CLIENT_ID
    const clientSecret = process.env.AUTH0_CLIENT_SECRET
    const audience = process.env.AUTH0_ISSUER_BASE_URL

    if (!clientId || !clientSecret || !audience) {
      throw new Error('Missing required environment variables')
    }

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      audience: `${audience}/api/v2/`,
    })

    // console.log('Request URL:', url)
    // console.log('Request Body:', body.toString())

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `HTTP error! status: ${response.status}, response: ${errorText}`
      )
    }

    const data = await response.json()
    // console.log(data)
    return data.access_token
  } catch (error) {
    console.error('Error creating access token:', error)
    throw error
  }
}
