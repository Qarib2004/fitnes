import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

config({ override: true })

const client = postgres(process.env.DATABASE_URL!)
export const db = drizzle(client, { schema })
export type Db = typeof db
