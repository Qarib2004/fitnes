import { relations, sql } from 'drizzle-orm'
import {
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', ['client', 'trainer', 'admin'])
export const userStatusEnum = pgEnum('user_status', ['active', 'blocked'])
export const bookingStatusEnum = pgEnum('booking_status', [
  'active',
  'canceled',
  'attended',
  'missed'
])

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: userRoleEnum('role').notNull().default('client'),
  status: userStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
})

export const packages = pgTable('packages', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  lessonsCount: integer('lessons_count').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  validityDays: integer('validity_days').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
})

export const clientPackages = pgTable(
  'client_packages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    packageId: uuid('package_id')
      .notNull()
      .references(() => packages.id, { onDelete: 'restrict' }),
    lessonsLeft: integer('lessons_left').notNull(),
    expiresAt: date('expires_at').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  table => ({
    userIdx: index('client_packages_user_id_idx').on(table.userId),
    packageIdx: index('client_packages_package_id_idx').on(table.packageId)
  })
)

export const classes = pgTable('classes', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  capacity: integer('capacity').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
})

export const rooms = pgTable('rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  capacity: integer('capacity').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
})

export const schedule = pgTable(
  'schedule',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    classId: uuid('class_id')
      .notNull()
      .references(() => classes.id, { onDelete: 'restrict' }),
    trainerId: uuid('trainer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    roomId: uuid('room_id').references(() => rooms.id, {
      onDelete: 'restrict'
    }),
    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  table => ({
    startsAtIdx: index('schedule_starts_at_idx').on(table.startsAt),
    trainerIdx: index('schedule_trainer_id_idx').on(table.trainerId),
    roomIdx: index('schedule_room_id_idx').on(table.roomId),
    classIdx: index('schedule_class_id_idx').on(table.classId)
  })
)

export const bookings = pgTable(
  'bookings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    scheduleId: uuid('schedule_id')
      .notNull()
      .references(() => schedule.id, { onDelete: 'cascade' }),
    clientPackageId: uuid('client_package_id')
      .notNull()
      .references(() => clientPackages.id, { onDelete: 'restrict' }),
    status: bookingStatusEnum('status').notNull().default('active'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  table => ({
    userIdx: index('bookings_user_id_idx').on(table.userId),
    scheduleIdx: index('bookings_schedule_id_idx').on(table.scheduleId),
    oneActiveBooking: uniqueIndex('bookings_one_active_per_user_schedule_idx')
      .on(table.userId, table.scheduleId)
      .where(sql`status = 'active'`)
  })
)

export const usersRelations = relations(users, ({ many }) => ({
  clientPackages: many(clientPackages),
  bookings: many(bookings),
  trainerSchedule: many(schedule)
}))

export const packagesRelations = relations(packages, ({ many }) => ({
  clientPackages: many(clientPackages)
}))

export const clientPackagesRelations = relations(
  clientPackages,
  ({ one, many }) => ({
    user: one(users, {
      fields: [clientPackages.userId],
      references: [users.id]
    }),
    package: one(packages, {
      fields: [clientPackages.packageId],
      references: [packages.id]
    }),
    bookings: many(bookings)
  })
)

export const classesRelations = relations(classes, ({ many }) => ({
  schedule: many(schedule)
}))

export const roomsRelations = relations(rooms, ({ many }) => ({
  schedule: many(schedule)
}))

export const scheduleRelations = relations(schedule, ({ one, many }) => ({
  class: one(classes, {
    fields: [schedule.classId],
    references: [classes.id]
  }),
  trainer: one(users, {
    fields: [schedule.trainerId],
    references: [users.id]
  }),
  room: one(rooms, {
    fields: [schedule.roomId],
    references: [rooms.id]
  }),
  bookings: many(bookings)
}))

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id]
  }),
  schedule: one(schedule, {
    fields: [bookings.scheduleId],
    references: [schedule.id]
  }),
  clientPackage: one(clientPackages, {
    fields: [bookings.clientPackageId],
    references: [clientPackages.id]
  })
}))

export type UserRole = (typeof userRoleEnum.enumValues)[number]
export type UserStatus = (typeof userStatusEnum.enumValues)[number]
export type BookingStatus = (typeof bookingStatusEnum.enumValues)[number]
