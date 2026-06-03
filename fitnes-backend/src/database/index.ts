import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

config({ override: true })

const client = postgres(process.env.DATABASE_URL!, {
  connect_timeout: 15,
  idle_timeout: 20,
  max: 5,
  max_lifetime: 60 * 30,
  prepare: false
})
export const db = drizzle(client, { schema })
export type Db = typeof db
