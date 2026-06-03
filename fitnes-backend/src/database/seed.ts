import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import {
  users,
  packages,
  clientPackages,
  classes,
  rooms,
  schedule,
  bookings
} from './schema'

const client = postgres(process.env.DATABASE_URL!)
const db = drizzle(client, { schema })

async function seed() {
  console.log('🌱 Seeding database...')

  // ─── Users ────────────────────────────────────────────────────────────────
  console.log('Inserting users...')
  await db
    .insert(users)
    .values([
      {
        id: '51726489-4aa5-462b-9847-2d8431d952fa',
        email: 'garib@gmail.com',
        name: 'Garib',
        role: 'trainer',
        status: 'active'
      },
      {
        id: '85ce9eaa-8ed3-4502-8656-c01d89efdaa1',
        email: 'admin@admin.com',
        name: 'admin',
        role: 'admin',
        status: 'active'
      },
      {
        id: 'c92bab06-05e4-4462-a07f-cfa2f6c947eb',
        email: 'elman@gmail.com',
        name: 'Elman',
        role: 'client',
        status: 'active'
      }
    ])
    .onConflictDoNothing()

  // ─── Packages ─────────────────────────────────────────────────────────────
  console.log('Inserting packages...')
  const insertedPackages = await db
    .insert(packages)
    .values([
      {
        title: 'Starter',
        lessonsCount: 8,
        price: '59.99',
        validityDays: 30
      },
      {
        title: 'Standard',
        lessonsCount: 16,
        price: '99.99',
        validityDays: 60
      },
      {
        title: 'Premium',
        lessonsCount: 32,
        price: '179.99',
        validityDays: 90
      }
    ])
    .returning()

  // ─── Rooms ────────────────────────────────────────────────────────────────
  console.log('Inserting rooms...')
  const insertedRooms = await db
    .insert(rooms)
    .values([
      { title: 'Main Hall', capacity: 20 },
      { title: 'Studio A', capacity: 10 },
      { title: 'Studio B', capacity: 15 }
    ])
    .returning()

  // ─── Classes ──────────────────────────────────────────────────────────────
  console.log('Inserting classes...')
  const insertedClasses = await db
    .insert(classes)
    .values([
      {
        title: 'Yoga',
        description: 'Relaxing yoga session for all levels',
        capacity: 15
      },
      {
        title: 'HIIT',
        description: 'High-intensity interval training',
        capacity: 12
      },
      {
        title: 'Pilates',
        description: 'Core strengthening and flexibility',
        capacity: 10
      }
    ])
    .returning()

  // ─── Schedule ─────────────────────────────────────────────────────────────
  console.log('Inserting schedule...')
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dayAfter = new Date(now)
  dayAfter.setDate(dayAfter.getDate() + 2)

  const makeTime = (base: Date, hour: number, durationHours = 1) => {
    const start = new Date(base)
    start.setHours(hour, 0, 0, 0)
    const end = new Date(start)
    end.setHours(hour + durationHours, 0, 0, 0)
    return { startsAt: start, endsAt: end }
  }

  const trainerId = '51726489-4aa5-462b-9847-2d8431d952fa'

  const insertedSchedule = await db
    .insert(schedule)
    .values([
      {
        classId: insertedClasses[0].id, // Yoga
        trainerId,
        roomId: insertedRooms[0].id,
        ...makeTime(tomorrow, 9)
      },
      {
        classId: insertedClasses[1].id, // HIIT
        trainerId,
        roomId: insertedRooms[1].id,
        ...makeTime(tomorrow, 11)
      },
      {
        classId: insertedClasses[2].id, // Pilates
        trainerId,
        roomId: insertedRooms[2].id,
        ...makeTime(dayAfter, 10)
      }
    ])
    .returning()

  // ─── Client Packages ──────────────────────────────────────────────────────
  console.log('Inserting client packages...')
  const clientId = 'c92bab06-05e4-4462-a07f-cfa2f6c947eb'

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 60)
  const expiresAtStr = expiresAt.toISOString().split('T')[0] // date only

  const insertedClientPackages = await db
    .insert(clientPackages)
    .values([
      {
        userId: clientId,
        packageId: insertedPackages[1].id, // Standard
        lessonsLeft: 14,
        expiresAt: expiresAtStr
      }
    ])
    .returning()

  // ─── Bookings ─────────────────────────────────────────────────────────────
  console.log('Inserting bookings...')
  await db.insert(bookings).values([
    {
      userId: clientId,
      scheduleId: insertedSchedule[0].id, // Yoga tomorrow
      clientPackageId: insertedClientPackages[0].id,
      status: 'active'
    },
    {
      userId: clientId,
      scheduleId: insertedSchedule[1].id, // HIIT tomorrow
      clientPackageId: insertedClientPackages[0].id,
      status: 'active'
    }
  ])

  console.log('✅ Seed complete!')
  await client.end()
}

seed().catch(err => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
