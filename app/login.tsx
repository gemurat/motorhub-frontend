export default function Login() {
  const redirectUri = encodeURIComponent('/inicio')
  return <a href={`/api/auth/login?redirect_uri=${redirectUri}`}>Login</a>
}
