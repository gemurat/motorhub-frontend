export function getDatabaseUrl(): string {
  const environment = process.env.DB_ENVIRONMENT || 'local'

  if (environment === 'railway') {
    return process.env.DATABASE_URL_RAILWAY || ''
  }

  return process.env.DATABASE_URL_LOCAL || ''
}

export function getPrismaDatabaseUrl(): string {
  const environment = process.env.DB_ENVIRONMENT || 'local'

  if (environment === 'railway') {
    return process.env.DATABASE_URL_RAILWAY || ''
  }

  return process.env.DATABASE_URL_LOCAL || ''
}

export function isRailwayDatabase(): boolean {
  return process.env.DB_ENVIRONMENT === 'railway'
}

export function isLocalDatabase(): boolean {
  return process.env.DB_ENVIRONMENT === 'local'
}

// Update the DATABASE_URL for Prisma
export function updatePrismaDatabaseUrl() {
  process.env.DATABASE_URL = getPrismaDatabaseUrl()
}
