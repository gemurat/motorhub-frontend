import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { UserService } from '@/services/userService'

// List of public paths that don't require authentication
const publicPaths = [
  '/api/auth',
  '/api/auth0',
  '/api/public',
  '/api/user/role',
  '/_next/static',
  '/_next/image',
  '/favicon.ico',
  '/public',
  '/login',
  '/unauthorized',
]

// Define role-based access control
const roleAccess: Record<string, string[]> = {
  admin: [
    '/',
    '/inicio',
    '/ventas',
    '/inventario',
    '/caja',
    '/finanzas',
    '/reportes',
    '/administrador',
    '/batch-tracking',
    // API endpoints
    '/api/admin',
    '/api/user',
    '/api/public',
    '/api/caja',
    '/api/vendedor',
    '/api/auth',
    '/api/stock-movements',
    '/api/product-stock',
    '/api/products',
    '/api/audit',
    '/api/store-inventory-batch',
    '/api/product-batches',
    '/api/low-stock-alerts',
    '/api/store-product-pricing',
    '/api/stock-alerts',
    '/api/store-inventory',
    '/api/expenses',
    '/api/empleados',
    '/api/mediosPago',
    '/api/giftcard',
    '/api/employee-sells',
    '/api/getMediosPago',
    '/api/paymets-by-id',
    '/api/giftcard-validator',
    '/api/test-db',
  ],
  vendedor: ['/', '/ventas', '/api/vendedor', '/api/products'],
  cajero: [
    '/',
    '/ventas',
    '/inventario',
    '/caja',
    '/batch-tracking',
    '/api/caja',
    '/api/mediosPago',
    '/api/giftcard',
    '/api/giftcard-validator',
    '/api/user/cashbox',
  ],
}

// Function to check if a path is public
const isPublicPath = (path: string) => {
  // Always allow Auth0 authentication endpoints
  if (path.startsWith('/api/auth') || path.startsWith('/api/auth0')) {
    return true
  }
  return publicPaths.some((publicPath) => path.startsWith(publicPath))
}

// Function to check if a path is allowed for a role
const isPathAllowedForRole = (path: string, role: string) => {
  // Skip role checking for public paths
  if (isPublicPath(path)) {
    return true
  }

  const normalizedRole = role.toLowerCase().trim()
  const allowedPaths = roleAccess[normalizedRole] || []

  // Admin has access to all API routes
  if (normalizedRole === 'admin' && path.startsWith('/api/')) {
    return true
  }

  // Check for exact path match or if the path starts with an allowed path
  const isAllowed = allowedPaths.some(
    (allowedPath) => path === allowedPath || path.startsWith(`${allowedPath}/`)
  )

  // Special handling for API routes
  if (path.startsWith('/api/')) {
    // For API routes, check if the role has access to the specific API
    const apiPath = path.split('/')[2] // Get the API path segment
    const hasApiAccess = allowedPaths.some((path) =>
      path.startsWith(`/api/${apiPath}`)
    )
    return hasApiAccess || isAllowed
  }

  return isAllowed
}

export default withMiddlewareAuthRequired({
  returnTo: (req) => {
    const url = new URL(req.url)
    return url.pathname
  },
  middleware: async (req: NextRequest) => {
    const path = req.nextUrl.pathname

    // Allow public paths
    if (isPublicPath(path)) {
      return NextResponse.next()
    }

    // Get the user's session
    const session = req.cookies.get('appSession')
    if (!session) {
      // Clear any remaining cookies and redirect to login
      const response = NextResponse.redirect(
        new URL('/api/auth/login', req.url)
      )
      response.cookies.delete('appSession')
      return response
    }

    try {
      // Fetch user role from your API
      const roleResponse = await fetch(new URL('/api/user/role', req.url), {
        headers: {
          Cookie: req.headers.get('cookie') || '',
        },
      })

      if (!roleResponse.ok) {
        console.error('Failed to fetch user role:', roleResponse.status)
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }

      const { role } = await roleResponse.json()
      console.log('Role from API:', role)

      // Check if the path is allowed for the user's role
      if (!isPathAllowedForRole(path, role)) {
        console.log('Access denied:', {
          path,
          role,
          normalizedRole: role.toLowerCase().trim(),
          allowedPaths: roleAccess[role.toLowerCase().trim()] || [],
        })
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }

      return NextResponse.next()
    } catch (error) {
      console.error('Error in middleware:', error)
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  },
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (Auth0 authentication endpoints)
     * - api/auth0 (Auth0 management endpoints)
     * - api/public (public API endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - / (home page)
     */
    '/((?!api/auth|api/auth0|api/public|_next/static|_next/image|favicon.ico|public|$).*)',
  ],
}
