import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { and, asc, eq, gt, gte, inArray, sql } from 'drizzle-orm'
import { DB } from '../database/database.module'
import {
  bookings,
  classes,
  clientPackages,
  schedule,
  users
} from '../database/schema'
import { CreateBookingDto } from './dto/create-booking.dto'
import { MarkAttendanceDto } from './dto/mark-attendance.dto'
import type { AuthUser } from '../auth/auth.types'
import type { Db } from '../database'

const FREE_CANCEL_HOURS = 2

@Injectable()
export class BookingsService {
  constructor(@Inject(DB) private readonly db: Db) {}

  getProfile(user: AuthUser) {
    const now = new Date()

    return Promise.all([
      this.db
        .select({
          id: clientPackages.id,
          packageId: clientPackages.packageId,
          lessonsLeft: clientPackages.lessonsLeft,
          expiresAt: clientPackages.expiresAt
        })
        .from(clientPackages)
        .where(
          and(
            eq(clientPackages.userId, user.id),
            gt(clientPackages.lessonsLeft, 0),
            gte(clientPackages.expiresAt, now.toISOString().slice(0, 10))
          )
        )
        .orderBy(asc(clientPackages.expiresAt)),
      this.db
        .select({
          id: bookings.id,
          status: bookings.status,
          startsAt: schedule.startsAt,
          endsAt: schedule.endsAt,
          classTitle: classes.title,
          trainerName: users.name
        })
        .from(bookings)
        .innerJoin(schedule, eq(bookings.scheduleId, schedule.id))
        .innerJoin(classes, eq(schedule.classId, classes.id))
        .innerJoin(users, eq(schedule.trainerId, users.id))
        .where(
          and(
            eq(bookings.userId, user.id),
            inArray(bookings.status, ['active', 'attended']),
            gte(schedule.startsAt, now)
          )
        )
        .orderBy(asc(schedule.startsAt))
    ]).then(([activePackages, upcomingBookings]) => ({
      user,
      activePackages,
      upcomingBookings
    }))
  }

  async create(user: AuthUser, dto: CreateBookingDto) {
    try {
      return await this.db.transaction(async tx => {
        await tx.execute(
          sql`select id from schedule where id = ${dto.scheduleId} for update`
        )

        const [slot] = await tx
          .select({
            id: schedule.id,
            capacity: classes.capacity
          })
          .from(schedule)
          .innerJoin(classes, eq(schedule.classId, classes.id))
          .where(eq(schedule.id, dto.scheduleId))
          .limit(1)

        if (!slot) {
          throw new NotFoundException('Schedule slot not found')
        }

        const [{ booked }] = await tx
          .select({
            booked:
              sql<number>`count(${bookings.id}) filter (where ${bookings.status} = 'active')`.mapWith(
                Number
              )
          })
          .from(bookings)
          .where(eq(bookings.scheduleId, dto.scheduleId))

        if (booked >= slot.capacity) {
          throw new ConflictException('No free spots left')
        }

        const today = new Date().toISOString().slice(0, 10)
        const [activePackage] = await tx
          .select()
          .from(clientPackages)
          .where(
            and(
              eq(clientPackages.userId, user.id),
              gt(clientPackages.lessonsLeft, 0),
              gte(clientPackages.expiresAt, today)
            )
          )
          .orderBy(asc(clientPackages.expiresAt))
          .limit(1)
          .for('update')

        if (!activePackage) {
          throw new BadRequestException('No active package with lessons left')
        }

        await tx
          .update(clientPackages)
          .set({
            lessonsLeft: sql`${clientPackages.lessonsLeft} - 1`,
            updatedAt: new Date()
          })
          .where(eq(clientPackages.id, activePackage.id))

        const [booking] = await tx
          .insert(bookings)
          .values({
            userId: user.id,
            scheduleId: dto.scheduleId,
            clientPackageId: activePackage.id
          })
          .returning()

        return booking
      })
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Booking already exists')
      }

      throw error
    }
  }

  async cancel(user: AuthUser, id: string) {
    return this.db.transaction(async tx => {
      const [booking] = await tx
        .select({
          id: bookings.id,
          userId: bookings.userId,
          status: bookings.status,
          clientPackageId: bookings.clientPackageId,
          startsAt: schedule.startsAt
        })
        .from(bookings)
        .innerJoin(schedule, eq(bookings.scheduleId, schedule.id))
        .where(eq(bookings.id, id))
        .limit(1)
        .for('update')

      if (!booking) {
        throw new NotFoundException('Booking not found')
      }

      if (booking.userId !== user.id && user.role !== 'admin') {
        throw new ForbiddenException('You can cancel only your own bookings')
      }

      if (booking.status !== 'active') {
        throw new BadRequestException('Only active bookings can be canceled')
      }

      const freeCancelUntil = new Date(
        booking.startsAt.getTime() - FREE_CANCEL_HOURS * 60 * 60 * 1000
      )
      const shouldRefund = new Date() < freeCancelUntil

      await tx
        .update(bookings)
        .set({
          status: 'canceled',
          updatedAt: new Date()
        })
        .where(eq(bookings.id, booking.id))

      if (shouldRefund) {
        await tx
          .update(clientPackages)
          .set({
            lessonsLeft: sql`${clientPackages.lessonsLeft} + 1`,
            updatedAt: new Date()
          })
          .where(eq(clientPackages.id, booking.clientPackageId))
      }

      return {
        id: booking.id,
        status: 'canceled',
        lessonRefunded: shouldRefund
      }
    })
  }

  async markAttendance(user: AuthUser, id: string, dto: MarkAttendanceDto) {
    const [booking] = await this.db
      .select({
        id: bookings.id,
        status: bookings.status,
        trainerId: schedule.trainerId
      })
      .from(bookings)
      .innerJoin(schedule, eq(bookings.scheduleId, schedule.id))
      .where(eq(bookings.id, id))
      .limit(1)

    if (!booking) {
      throw new NotFoundException('Booking not found')
    }

    if (user.role !== 'admin' && booking.trainerId !== user.id) {
      throw new ForbiddenException(
        'Only class trainer or admin can mark attendance'
      )
    }

    if (booking.status !== 'active') {
      throw new BadRequestException('Only active bookings can be marked')
    }

    const [updated] = await this.db
      .update(bookings)
      .set({
        status: dto.status,
        updatedAt: new Date()
      })
      .where(eq(bookings.id, id))
      .returning()

    return updated
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    )
  }
}
