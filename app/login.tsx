export default function Login() {
  const redirectUri = encodeURIComponent('http://localhost:3000/inicio')
  return <a href={`/api/auth/login?redirect_uri=${redirectUri}`}>Login</a>
}
