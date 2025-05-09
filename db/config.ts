'use server'

import dotenv from 'dotenv'

dotenv.config()

// This file should only be imported in server components or server actions
export async function getDbConfig() {
  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  }
}
